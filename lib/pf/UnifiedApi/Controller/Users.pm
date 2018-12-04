package pf::UnifiedApi::Controller::Users;

=head1 NAME

pf::UnifiedApi::Controller::User -

=cut

=head1 DESCRIPTION

pf::UnifiedApi::Controller::User

=cut

use strict;
use warnings;
use Mojo::Base 'pf::UnifiedApi::Controller::Crud';
use pf::dal::person;
use pf::dal::node;
use pf::dal::violation;
use pf::constants;
use pf::person;
use pf::node;
use pf::constants qw($default_pid);
use pf::error qw(is_error);

has dal => 'pf::dal::person';
has url_param_name => 'user_id';
has primary_key => 'pid';

=head2 unassign_nodes

unassign user nodes

=cut

sub unassign_nodes {
    my ($self) = @_;
    my $pid = $self->id;
    my $count = person_unassign_nodes($pid);
    if (!defined $count) {
        return $self->render_error(500, "Unable the unassign nodes for $pid");
    }

    return $self->render(status => 200, json => {count => $count});
}

=head2 bulk_register

bulk_register

=cut

sub bulk_register {
    my ($self) = @_;
    my ($status, $data) = $self->parse_json;
    if (is_error($status)) {
        return $self->render(json => $data, status => $status);
    }

    my $items = $data->{items} // [];
    ($status, my $iter) = pf::dal::node->search(
        -columns => [qw(mac pid node.category_id)],
        -where => {
            pid => { -in => $items},
            status => { "!=" => $pf::node::STATUS_REGISTERED }
        },
        -with_class => undef,
    );

    my ($indexes, $results) = bulk_init_results($items, 'nodes');
    my $nodes = $iter->all;
    for my $node (@$nodes) {
        my $pid = delete $node->{pid};
        my $mac = $node->{mac};
        my ($result, $msg) = node_register($mac, $pid, category_id => delete $node->{category_id});
        my %status = ( mac => $mac );
        if ($result) {
            $node->{status} = 200;
            pf::enforcement::reevaluate_access($mac, "admin_modify");
        } else {
            $node->{status} = 422;
            $node->{message} = $msg // '';
        }

        push @{$results->[$indexes->{$pid}]{nodes}}, $node;
    }

    return $self->render(status => 200, json => { items => $results });
}

=head2 bulk_deregister

bulk_deregister

=cut

sub bulk_deregister {
    my ($self) = @_;
    my ($status, $data) = $self->parse_json;
    if (is_error($status)) {
        return $self->render(json => $data, status => $status);
    }

    my $items = $data->{items} // [];
    ($status, my $iter) = pf::dal::node->search(
        -columns => [qw(mac pid)],
        -where => {
            pid => { -in => $items},
            status => { "!=" => $pf::node::STATUS_UNREGISTERED }
        },
        -with_class => undef,
    );

    if (is_error($status)) {
        return $self->render_error($status, "Error finding nodes");
    }

    my ($indexes, $results) = bulk_init_results($items, 'nodes');
    my $nodes = $iter->all;
    for my $node (@$nodes) {
        my $pid = delete $node->{pid};
        my $mac = $node->{mac};
        my $result = node_deregister($mac);
        if ($result) {
            $node->{status} = 200;
            pf::enforcement::reevaluate_access($mac, "admin_modify");
        } else {
            $node->{status} = 422;
        }

        push @{$results->[$indexes->{$pid}]{nodes}}, $node;
    }

    return $self->render(status => 200, json => { items => $results });
}

=head2 bulk_close_violations

bulk_close_violations

=cut

sub bulk_close_violations {
    my ($self) = @_;
    my ($status, $data) = $self->parse_json;
    if (is_error($status)) {
        return $self->render(json => $data, status => $status);
    }

    my $items = $data->{items} // [];
    ($status, my $iter) = pf::dal::violation->search(
        -where => {
            'node.pid' => { -in => $items},
            status => "open",
        },
        -columns => [qw(violation.vid violation.mac node.pid)],
        -from => [-join => qw(violation <=>{violation.vid=class.vid} class), '=>{violation.tenant_id=node.tenant_id,violation.mac=node.mac}', 'node'],
        -with_class => undef,
    );

    if (is_error($status)) {
        return $self->render_error($status, "Error finding violations");
    }

    my ($indexes, $results) = bulk_init_results($items, 'violations');
    my $violations = $iter->all;
    for my $violation (@$violations) {
        my $pid = delete $violation->{pid};
        my $mac = $violation->{mac};
        my $index = $indexes->{$pid};
        if (violation_force_close($mac, $violation->{vid})) {
            pf::enforcement::reevaluate_access($mac, "admin_modify");
            $violation->{status} = 200;
        } else {
            $violation->{status} = 422;
        }

        push @{$results->[$indexes->{$pid}]{violations}}, $violation;
    }

    return $self->render(status => 200, json => { items => $results });
}

=head2 bulk_apply_violation

bulk_apply_violation

=cut

sub bulk_apply_violation {
    my ($self) = @_;
    my ($status, $data) = $self->parse_json;
    if (is_error($status)) {
        return $self->render(json => $data, status => $status);
    }

    my $items = $data->{items} // [];
    my $vid = $data->{vid};
    ($status, my $iter) = pf::dal::node->search(
        -columns => [qw(mac pid)],
        -where => {
            pid => { -in => $items},
        },
        -with_class => undef,
    );

    if (is_error($status)) {
        return $self->render_error($status, "Error finding nodes");
    }

    my ($indexes, $results) = bulk_init_results($items, 'violations');
    my $nodes = $iter->all;
    for my $node (@$nodes) {
        my $pid = delete $node->{pid};
        my $mac = $node->{mac};
        $node->{'vid'} = $vid;
        my ($last_id) = violation_add($mac, $vid, ( 'force' => $TRUE ));
        $node->{status} = $last_id > 0 ? 200 : 422;
        push @{$results->[$indexes->{$pid}]{violations}}, $node;
    }

    return $self->render( status => 200, json => { items => $results } );
}

=head2 bulk_reevaluate_access

bulk_reevaluate_access

=cut

sub bulk_reevaluate_access {
    my ($self) = @_;
    my ($status, $data) = $self->parse_json;
    if (is_error($status)) {
        return $self->render(json => $data, status => $status);
    }

    my $items = $data->{items} // [];
    ($status, my $iter) = pf::dal::node->search(
        -columns => [qw(mac pid)],
        -where => {
            pid => { -in => $items},
        },
        -with_class => undef,
    );
    if (is_error($status)) {
        return $self->render_error($status, "Error finding nodes");
    }

    my ($indexes, $results) = bulk_init_results($items, 'nodes');
    my $nodes = $iter->all;
    for my $node (@$nodes) {
        my $pid = delete $node->{pid};
        my $result = pf::enforcement::reevaluate_access($node->{mac}, "admin_modify");
        $node->{status} = $result ? 200 : 422;
        push @{$results->[$indexes->{$pid}]{nodes}}, $node;
    }

    return $self->render(status => 200, json => { items => $results });
}

=head2 bulk_init_results

bulk_init_results

=cut

sub bulk_init_results {
    my ($items, $key) = @_;
    $key //= 'nodes';
    my $i = 0;
    my %index = map { $_ => $i++ } @$items;
    my @results = map { { pid => $_, $key => []} } @$items;
    return (\%index, \@results);
}

=head2 bulk_fingerbank_refresh

bulk_fingerbank_refresh

=cut

sub bulk_fingerbank_refresh {
    my ($self) = @_;
    my ($status, $data) = $self->parse_json;
    if (is_error($status)) {
        return $self->render(json => $data, status => $status);
    }

    my $items = $data->{items} // [];
    ($status, my $iter) = pf::dal::node->search(
        -columns => [qw(mac pid)],
        -where => {
            pid => { -in => $items},
        },
        -with_class => undef,
    );
    if (is_error($status)) {
        return $self->render_error($status, "Error finding nodes");
    }

    my ($indexes, $results) = bulk_init_results($items);
    for my $node (@$nodes) {
        my $mac = $node->{mac};
        my $pid = delete $node->{pid};
        my $result = pf::fingerbank::process($mac, $TRUE);
        $node->{status} = $result ? 200 : 422;
        push @{$results->[$indexes->{$pid}]{nodes}}, $node;
    }

    return $self->render(status => 200, json => { items => $results });
}


=head2 do_bulk_update_field

do_bulk_update_field

=cut

sub do_bulk_update_field {
    my ($self, $field) = @_;
    my ($status, $data) = $self->parse_json;
    if (is_error($status)) {
        return $self->render(json => $data, status => $status);
    }

    my $items = $data->{items} // [];
    my $value = $data->{$field};
    ($status, my $iter) = $self->dal->search(
        -columns => [qw(mac pid)],
        -where => {
            pid => { -in => $items },
            $field => [ {"!=" => $value}, defined $value ? ({"=" => undef} ) : () ],
        },
        -from => $self->dal->table,
        -with_class => undef,
    );

    if (is_error($status)) {
        return $self->render_error($status, "Error finding nodes");
    }

    my ($indexes, $results) = bulk_init_results($items, 'nodes');
    my $nodes = $iter->all;
    for my $node (@$nodes) {
        my $mac = $node->{mac};
        my $pid = delete $node->{pid};
        my $result = node_modify($mac, $field => $value);
        if ($result) {
            $node->{status} = 200;
            pf::enforcement::reevaluate_access($mac, "admin_modify");
        } else {
            $node->{status} = 422;
        }

        push @{$results->[$indexes->{$pid}]{nodes}}, $node;
    }

    return $self->render( status => 200, json => { items => $results } );
}

=head2 bulk_apply_role

bulk_apply_role

=cut

sub bulk_apply_role {
    my ($self) = @_;
    return $self->do_bulk_update_field('category_id');
}

=head2 bulk_apply_bypass_role

bulk_apply_bypass_role

=cut

sub bulk_apply_bypass_role {
    my ($self) = @_;
    return $self->do_bulk_update_field('bypass_role_id');
}

=head1 AUTHOR

Inverse inc. <info@inverse.ca>

=head1 COPYRIGHT

Copyright (C) 2005-2019 Inverse inc.

=head1 LICENSE

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301,
USA.

=cut

1;

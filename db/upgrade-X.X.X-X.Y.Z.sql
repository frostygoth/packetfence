--                                                                                                                     
-- PacketFence SQL schema upgrade from X.X.X to X.Y.Z
--                                                                                                                     
                                                                                                                       

--
-- Setting the major/minor/sub-minor version of the DB                                                                 
--                                                                                                                     

SET @MAJOR_VERSION = 8; 
SET @MINOR_VERSION = 1;
SET @SUBMINOR_VERSION = 9;                                                                                             
                                                                                                                       
SET @PREV_MAJOR_VERSION = 8;                                                                                           
SET @PREV_MINOR_VERSION = 1;
SET @PREV_SUBMINOR_VERSION = 0;                                                                                        
                                                                                                                       

--                                                                                                                     
-- The VERSION_INT to ensure proper ordering of the version in queries
--                                                                                                                     

SET @VERSION_INT = @MAJOR_VERSION << 16 | @MINOR_VERSION << 8 | @SUBMINOR_VERSION;                                     

SET @PREV_VERSION_INT = @PREV_MAJOR_VERSION << 16 | @PREV_MINOR_VERSION << 8 | @PREV_SUBMINOR_VERSION;                 

DROP PROCEDURE IF EXISTS ValidateVersion;                                                                              
--
-- Updating to current version
--  
DELIMITER //
CREATE PROCEDURE ValidateVersion()
BEGIN                                                                                                                  
    DECLARE PREVIOUS_VERSION int(11);
    DECLARE PREVIOUS_VERSION_STRING varchar(11);
    DECLARE _message varchar(255);
    SELECT id, version INTO PREVIOUS_VERSION, PREVIOUS_VERSION_STRING FROM pf_version ORDER BY id DESC LIMIT 1;        
              
      IF PREVIOUS_VERSION != @PREV_VERSION_INT THEN                                                                    
        SELECT CONCAT('PREVIOUS VERSION ', PREVIOUS_VERSION_STRING, ' DOES NOT MATCH ', CONCAT_WS('.', @PREV_MAJOR_VERSION, @PREV_MINOR_VERSION, @PREV_SUBMINOR_VERSION)) INTO _message;
        SIGNAL SQLSTATE VALUE '99999'                                                                                  
              SET MESSAGE_TEXT = _message;                                                                             
      END IF;                                                                                                          
END
//                                                                                                                     

DELIMITER ;                                                                                                            
call ValidateVersion;                                                                                                  

--
-- Adjust the pf_version engine so its synchronized in a cluster
--
ALTER TABLE pf_version engine = InnoDB;
    
--
-- Add other canadian SMS carriers
--

INSERT INTO sms_carrier VALUES(100122, 'Koodo Mobile', '%s@msg.koodomobile.com', now(), now());
INSERT INTO sms_carrier VALUES(100123, 'Chatr', '%s@pcs.rogers.com', now(), now());
INSERT INTO sms_carrier VALUES(100124, 'Eastlink', '%s@txt.eastlink.ca', now(), now());
INSERT INTO sms_carrier VALUES(100125, 'Freedom', 'txt.freedommobile.ca', now(), now());
INSERT INTO sms_carrier VALUES(100126, 'PC Mobile', '%s@msg.telus.com', now(), now());
INSERT INTO sms_carrier VALUES(100127, 'TBayTel', '%s@pcs.rogers.com', now(), now());

INSERT INTO pf_version (id, version) VALUES (@VERSION_INT, CONCAT_WS('.', @MAJOR_VERSION, @MINOR_VERSION, @SUBMINOR_VERSION)); 
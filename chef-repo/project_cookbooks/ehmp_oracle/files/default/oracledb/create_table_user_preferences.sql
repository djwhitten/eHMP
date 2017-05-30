DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := '
    CREATE TABLE COMMUNICATION.USER_PREFERENCES
    (
      USER_ID         VARCHAR2(36) NOT NULL,
      CATEGORY_SYSTEM VARCHAR2(255) NOT NULL,
      CATEGORY_CODE   VARCHAR2(255) NOT NULL,
      ENABLED         VARCHAR2(1) NOT NULL,
      CONSTRAINT USER_PREFERENCES_PK PRIMARY KEY (USER_ID, CATEGORY_SYSTEM, CATEGORY_CODE) USING INDEX TABLESPACE "COMM_X",
      CONSTRAINT ENABLED_CHK CHECK (ENABLED IN (''Y'', ''N''))
    )';
  EXECUTE IMMEDIATE sql_statement;
EXCEPTION
WHEN OTHERS THEN
  IF SQLCODE = -955 THEN
    NULL; -- suppresses ORA-00955 exception
  ELSE
    RAISE;
  END IF;
END;
/

--------------------------------------------------------
--  DDL for Index USER_PREFERENCES_CATEGORY_I
--------------------------------------------------------

DECLARE
  sql_statement VARCHAR2(4000);
BEGIN
  sql_statement := '
    CREATE INDEX "COMMUNICATION"."USER_PREFERENCES_CATEGORY_I" ON "COMMUNICATION"."USER_PREFERENCES" ("CATEGORY_SYSTEM", "CATEGORY_CODE") 
    TABLESPACE "COMM_X"';
  EXECUTE IMMEDIATE sql_statement;
EXCEPTION
WHEN OTHERS THEN
  IF SQLCODE = -955 THEN
    NULL; -- suppresses ORA-00955 exception
  ELSE
    RAISE;
  END IF;
END;
/

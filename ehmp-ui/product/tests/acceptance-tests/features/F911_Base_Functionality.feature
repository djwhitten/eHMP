@F911 @US11427   @base_test @base @reg1
Feature: Convert Rspec/firefox Tests to Cucumber/phantomjs

@TC405 @TC406 @TC407 @TC409 @TC411 @TC412 @TC414 @TC415
Scenario: The cover sheet screen should load without issue
#  Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  When Cover Sheet is active
  Then the Active Medications Summary applet is displayed
  Then the Allergies Trend applet is displayed
  Then the Appt and Visits Summary applet is displayed
  Then the Immunization Summary applet is displayed
  Then the Numeric Lab Results Summary applet is displayed
  Then the Orders Summary applet is displayed
  Then the Problems Summary applet is displayed
  Then the Vitals Summary applet is displayed
  Then the Community Health Summaries applet Summary is displayed
  And 'An error has occured' is not displayed in any of the coversheet applets

@TC416 @TC417 @TC418 @TC419 @TC420 @TC421 @TC422 @TC423 @DE6976
Scenario: The overview screen should load without issue
#  Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  Then Overview is active 
  Then the Numeric Lab Results Trend applet is displayed
  Then the Vitals Trend applet is displayed
  Then the Immunization Trend applet is displayed
  Then the Active Medications Trend applet is displayed
  Then the Problems Trend applet is displayed
  Then the Allergies Trend applet is displayed
  Then the Reports Summary applet is displayed
  Then the Encounters Trend applet is displayed
  Then the Clinical Reminders Summary applet is displayed
  And 'An error has occured' is not displayed in any of the overview applets

@TC408 @DE1786
Scenario: The document screen should load without issue
#  Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  When user navigates to Documents Screen
  Then the Documents Expanded applet is displayed

@TC410 
Scenario: The timeline screen should load without issue
#  Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  When user navigates to Timeline Applet
  Then the Timeline Summary applet is displayed

@TC413 
Scenario: The user should be able to perform a text search
#  Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Summary View is active
  Then user searches for "pulse"
  Then text search results are grouped

@TC486
Scenario: The med review screen should load without issue
#  Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  When user navigates to Meds Review Applet
  Then the Med Review applet is displayed

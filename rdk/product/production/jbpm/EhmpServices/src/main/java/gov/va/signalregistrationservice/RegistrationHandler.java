package gov.va.signalregistrationservice;

import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;
import org.kie.internal.runtime.Cacheable;
import org.kie.internal.runtime.Closeable;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.ehmp.services.exception.ErrorResponseUtil;
import gov.va.kie.utils.WorkItemUtil;
import gov.va.signalregistrationservice.util.RegistrationUtil;

import java.math.BigDecimal;

import javax.persistence.EntityManager;

import org.jboss.logging.Logger;
import org.kie.api.definition.process.Process;
import org.springframework.http.HttpStatus;

public class RegistrationHandler implements WorkItemHandler, Closeable,
		Cacheable {

	private static final String EVENT_ACTION_SCOPE = "Signaling";
	private static final String EVENT_API_VERSION = "1.0";
	private static final Logger LOGGER = Logger.getLogger(RegistrationHandler.class);
	private KieSession ksession;
	public RegistrationHandler(KieSession ksession){
		this.ksession = ksession;		
	}
   
	public RegistrationHandler(){
	}
	
	public void close() {
		// Do nothing
	}

	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		String serviceResponse;
		JsonObject matchJsonObject = null;
		
		try {
			LOGGER.info("Signal Service RegistrationHandler.executeWorkItem has been called");

			String signalName  = WorkItemUtil.extractRequiredStringParam(workItem, "signalName");	
			LOGGER.debug("Signal Service RegistrationHandler.executeWorkItem: signalName=" + signalName);
			
			String signalContent  = WorkItemUtil.extractRequiredStringParam(workItem, "signalContent");				
			LOGGER.debug("Signal Service RegistrationHandler.executeWorkItem: signalContent=" + signalContent);
			
			String matchObject  = WorkItemUtil.extractRequiredStringParam(workItem, "matchObject");
			LOGGER.debug("Signal Service RegistrationHandler.executeWorkItem: matchObject=" + matchObject);
						
			try {
				JsonParser parser = new JsonParser();
				matchJsonObject = parser.parse(matchObject).getAsJsonObject();
			}
			catch(Exception e) {
				throw new EhmpServicesException(HttpStatus.BAD_REQUEST, e.getMessage());
			}
			
			String eventDescription  = WorkItemUtil.extractRequiredStringParam(workItem, "eventDescription");	
			LOGGER.debug("Signal Service RegistrationHandler.executeWorkItem: eventDescription=" + eventDescription);
			
			String eventName  = WorkItemUtil.extractRequiredStringParam(workItem, "eventName");
			LOGGER.debug("Signal Service RegistrationHandler.executeWorkItem: eventName=" + eventName);

			long processInstanceId = workItem.getProcessInstanceId();
			LOGGER.debug("Signal Service RegistrationHandler.executeWorkItem: processInstanceId=" + processInstanceId);
		
			insertDataIntoEventMatchingTables(signalName, signalContent,
					eventDescription, eventName, matchJsonObject,
					processInstanceId);
						
			serviceResponse = RegistrationUtil.buildSuccessResponse();
			
		}
		catch (EhmpServicesException e) {
			e.printStackTrace();
			serviceResponse = e.toJsonString();
		} catch (Exception e) {
			LOGGER.error("RegistrationHandler.executeWorkItem: An unexpected condition has happened: " + e.getMessage(), e);
			serviceResponse = ErrorResponseUtil.create(HttpStatus.INTERNAL_SERVER_ERROR, "RegistrationHandler.executeWorkItem: An unexpected condition has happened: ", e.getMessage());
		}
		
		WorkItemUtil.completeWorkItem(workItem, manager, serviceResponse);
	}

	/**
	 * @param signalName
	 * @param signalContent
	 * @param eventDescription
	 * @param eventName
	 * @param matchJsonObject
	 * @param processInstanceId
	 */
	private void insertDataIntoEventMatchingTables(String signalName,
			String signalContent, String eventDescription, String eventName,
			JsonObject matchJsonObject, long processInstanceId) throws EhmpServicesException {
		
		try {
			EntityManager em = RegistrationUtil.getEntityManager(ksession);
			em.joinTransaction();
			
			// Insert row into EVENT_MATCH_CRITERIA			
			BigDecimal eventMatchCriteriaId = RegistrationUtil.createMatchCriteria(em);
			LOGGER.debug("Signal Service RegistrationHandler.executeWorkItem: EVENT_MATCH_CRITERIA record created. eventMatchCriteriaId = " + eventMatchCriteriaId);
	
			Process process = ksession.getProcessInstance(processInstanceId).getProcess();
			
			// Insert row into EVENT_MATCH_ACTION
			BigDecimal eventMatchActionId = RegistrationUtil.createMatchAction(em, processInstanceId, signalName, signalContent, process.getId(), process.getVersion());
			LOGGER.debug("Signal Service RegistrationHandler.executeWorkItem: EVENT_MATCH_ACTION record created. eventMatchActionId = " + eventMatchActionId);
			
			// Insert row(s) into SIMPLE_MATCH
			RegistrationUtil.createSimpleMatchRecords(em, matchJsonObject, eventMatchCriteriaId);
			LOGGER.debug("Signal Service RegistrationHandler.executeWorkItem: SIMPLE_MATCH record created.");
	
			// Insert row into AM_EVENTLISTENER
			RegistrationUtil.createEventListener(em, EVENT_ACTION_SCOPE, EVENT_API_VERSION, eventDescription, eventName, eventMatchCriteriaId, eventMatchActionId);
			LOGGER.debug("Signal Service RegistrationHandler.executeWorkItem: AM_EVENTLISTENER record created.");
		}
		catch(Exception e) {
			throw new EhmpServicesException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage()); 
		}
	}


	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		LOGGER.debug("Signal Service RegistrationHandler.abortWorkItem has been called");
	}	
}

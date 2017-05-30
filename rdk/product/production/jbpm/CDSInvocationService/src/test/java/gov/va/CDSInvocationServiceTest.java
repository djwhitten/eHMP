package gov.va;

import static org.junit.Assert.*;
import org.junit.Test;
import org.springframework.web.client.RestTemplate;

public class CDSInvocationServiceTest {


	CDSInvocationServiceHandler cdsHandler = new CDSInvocationServiceHandler() {

        @Override
        public String invokeCDS(String LabFHIRResult) {

    		String jsonFHIRLabResults = CDSInvocationEnvelope.replace("@LabFHIRResult@", LabFHIRResult);

            if (jsonFHIRLabResults.indexOf("\"status\":\"final\",\"valueString\":\"POS\"") > -1) {
    			return "Abnormal";
    		} else {
            	return "Normal";
            }
    	}
    };

    @Test
    public void testgetCDSInvocationUrl() {
    	String cdsUrl = CDSInvocationServiceHandler.getCDSInvocationUrl();
        assertNotNull(cdsUrl);
    }

    @Test
    public void testgetRestTemplate() {
    	RestTemplate restTemplate = CDSInvocationServiceHandler.getRestTemplate();
        assertNotNull(restTemplate);
    }

    @Test
    public void testinvokeCDSNormal() {

        String LabFHIRResultNeg = "{\"resourceType\":\"Bundle\",\"type\":\"collection\",\"id\":\"6d2f1956-3d8d-4959-8698-2bb8c8b43ed1\",\"link\":[{\"relation\":\"self\",\"url\":\"http://SERVER:PORT/resource/fhir/patient/10108V420871/diagnosticreport?domain=lab&name=OCCULT%20BLOOD&_sort:asc=date&_count=1&accessCode=REDACTED&verifyCode=REDACTED&site=9E7A\"}],\"total\":2,\"entry\":[{\"resource\":{\"resourceType\":\"DiagnosticReport\",\"name\":{\"text\":\"OCCULT BLOOD\",\"coding\":[{\"system\":\"urn:oid:2.16.840.1.113883.4.642.2.58\",\"code\":\"urn:va:ien:60:1359:139\",\"display\":\"OCCULT BLOOD\"}]},\"status\":\"final\",\"issued\":\"2015-10-19T08:30:00\",\"subject\":{\"reference\":\"Patient/10108V420871\"},\"performer\":{\"reference\":\"#f121237a-eff0-470b-a19d-c5c163f827b1\",\"display\":\"ALBANY VA MEDICAL CENTER\"},\"contained\":[{\"resourceType\":\"Organization\",\"id\":\"f121237a-eff0-470b-a19d-c5c163f827b1\",\"identifier\":[{\"type\":{\"text\":\"facility-code\"},\"value\":\"500\"}],\"name\":\"ALBANY VA MEDICAL CENTER\",\"address\":[{\"text\":\"VA MEDICAL CENTER 1 3RD sT. ALBANY, NY 12180-0097\",\"state\":\"NY\",\"city\":\"ALBANY\",\"line\":[\"ALBANY VA MEDICAL CENTER\",\"VA MEDICAL CENTER 1 3RD sT.\"],\"postalCode\":\"12180-0097\"}],\"text\":{\"status\":\"generated\",\"div\":\"<div>ALBANY VA MEDICAL CENTER<br/>VA MEDICAL CENTER 1 3RD sT. ALBANY, NY 12180-0097</div>\"}},{\"resourceType\":\"Specimen\",\"id\":\"7c8d954d-c54b-483e-9d33-6d5708c22221\",\"type\":{\"text\":\"FECES\"},\"subject\":{\"reference\":\"Patient/10108V420871\"},\"collection\":{\"collectedDateTime\":\"2015-10-19T07:00:00\"}},{\"resourceType\":\"Observation\",\"id\":\"b49e1926-147d-488b-851e-f9c950a36703\",\"code\":{\"text\":\"OCCULT BLOOD\",\"coding\":[{\"system\":\"urn:oid:2.16.840.1.113883.4.642.2.58\",\"code\":\"urn:va:ien:60:1359:139\",\"display\":\"OCCULT BLOOD\"}]},\"status\":\"final\",\"valueString\":\"NEG\",\"reliability\":\"ok\",\"specimen\":{\"reference\":\"#7c8d954d-c54b-483e-9d33-6d5708c22221\",\"display\":\"FECES\"},\"referenceRange\":[{\"high\":{\"value\":null},\"low\":{\"value\":null}}]}],\"identifier\":[{\"system\":\"urn:oid:2.16.840.1.113883.6.233\",\"value\":\"urn:va:lab:9E7A:3:CH;6848979.93;500027\"}],\"serviceCategory\":{\"text\":\"Chemistry\",\"coding\":[{\"system\":\"http://hl7.org/fhir/v2/0074\",\"code\":\"CH\",\"display\":\"Chemistry\"}]},\"diagnosticDateTime\":\"2015-10-19T07:00:00\",\"specimen\":[{\"reference\":\"#7c8d954d-c54b-483e-9d33-6d5708c22221\",\"display\":\"FECES\"}],\"extension\":[{\"url\":\"http://vistacore.us/fhir/extensions/lab#abnormal\",\"valueBoolean\":false},{\"url\":\"http://vistacore.us/fhir/extensions/lab#categoryCode\",\"valueString\":\"urn:va:lab-category:CH\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#categoryName\",\"valueString\":\"Laboratory\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#displayName\",\"valueString\":\"OCC BLD\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#displayOrder\",\"valueDecimal\":998.0500027},{\"url\":\"http://vistacore.us/fhir/extensions/lab#facilityCode\",\"valueString\":\"500\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#groupName\",\"valueString\":\"URINE 1019 1\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#groupUid\",\"valueString\":\"urn:va:accession:9E7A:3:CH;6848979.93\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#high\",\"valueString\":\"POS\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#kind\",\"valueString\":\"Laboratory\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#localId\",\"valueString\":\"CH;6848979.93;500027\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#micro\",\"valueBoolean\":false},{\"url\":\"http://vistacore.us/fhir/extensions/lab#pid\",\"valueString\":\"9E7A;3\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#qualifiedName\",\"valueString\":\"OCCULT BLOOD (FECES)\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#result\",\"valueString\":\"NEG\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#specimen\",\"valueString\":\"FECES\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#stampTime\",\"valueString\":\"20151019083000\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#statusCode\",\"valueString\":\"urn:va:lab-status:completed\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#summary\",\"valueString\":\"OCCULT BLOOD (FECES) NEG\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#typeId\",\"valueInteger\":1359},{\"url\":\"http://vistacore.us/fhir/extensions/lab#lastUpdateTime\",\"valueString\":\"20151019083000\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#low\",\"valueString\":\"NEG.\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#orderUid\",\"valueString\":\"urn:va:order:9E7A:3:39004\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#lnccodes[0]\",\"valueString\":\"urn:va:ien:60:1359:139\"}],\"result\":[{\"reference\":\"#b49e1926-147d-488b-851e-f9c950a36703\",\"display\":\"OCCULT BLOOD\"}],\"text\":{\"status\":\"generated\",\"div\":\"<div>Collected: 2015-10-19T07:00:00<br/>Report Released: 2015-10-19T08:30:00<br/>Accession: urn:va:accession:9E7A:3:CH;6848979.93<br/>Test: OCCULT BLOOD<br/>Result: NEG<br/>Specimen: FECES<br/>Performing Lab: ALBANY VA MEDICAL CENTER<br/>undefined<br/>undefined<br/></div>\"}}}]}";
        String resultNormal = cdsHandler.invokeCDS(LabFHIRResultNeg);
        assertNotNull(resultNormal);
        assertEquals("Normal", resultNormal);

    }

    @Test
    public void testinvokeCDSAbnormal() {

        String LabFHIRResultPos = "{\"resourceType\":\"Bundle\",\"type\":\"collection\",\"id\":\"c91249a3-3478-4da3-bb84-28c91c948064\",\"link\":[{\"relation\":\"self\",\"url\":\"http://SERVER:PORT/resource/fhir/patient/10108V420871/diagnosticreport?domain=lab&name=OCCULT%20BLOOD&_sort:desc=date&_count=1&accessCode=REDACTED&verifyCode=REDACTED&site=9E7A\"}],\"total\":2,\"entry\":[{\"resource\":{\"resourceType\":\"DiagnosticReport\",\"name\":{\"text\":\"OCCULT BLOOD\",\"coding\":[{\"system\":\"urn:oid:2.16.840.1.113883.4.642.2.58\",\"code\":\"urn:va:ien:60:1359:139\",\"display\":\"OCCULT BLOOD\"}]},\"status\":\"final\",\"issued\":\"2015-10-21T10:35:00\",\"subject\":{\"reference\":\"Patient/10108V420871\"},\"performer\":{\"reference\":\"#ce7888a0-3c5d-4574-9ca5-c01ebad7758a\",\"display\":\"ALBANY VA MEDICAL CENTER\"},\"contained\":[{\"resourceType\":\"Organization\",\"id\":\"ce7888a0-3c5d-4574-9ca5-c01ebad7758a\",\"identifier\":[{\"type\":{\"text\":\"facility-code\"},\"value\":\"500\"}],\"name\":\"ALBANY VA MEDICAL CENTER\",\"address\":[{\"text\":\"VA MEDICAL CENTER 1 3RD sT. ALBANY, NY 12180-0097\",\"state\":\"NY\",\"city\":\"ALBANY\",\"line\":[\"ALBANY VA MEDICAL CENTER\",\"VA MEDICAL CENTER 1 3RD sT.\"],\"postalCode\":\"12180-0097\"}],\"text\":{\"status\":\"generated\",\"div\":\"<div>ALBANY VA MEDICAL CENTER<br/>VA MEDICAL CENTER 1 3RD sT. ALBANY, NY 12180-0097</div>\"}},{\"resourceType\":\"Specimen\",\"id\":\"a5b075bf-29f5-4f81-b681-e3df7d7b3c34\",\"type\":{\"text\":\"FECES\"},\"subject\":{\"reference\":\"Patient/10108V420871\"},\"collection\":{\"collectedDateTime\":\"2015-10-21T10:15:00\"}},{\"resourceType\":\"Observation\",\"id\":\"4c3fa78f-ef9f-4e65-9690-312be4fd1094\",\"code\":{\"text\":\"OCCULT BLOOD\",\"coding\":[{\"system\":\"urn:oid:2.16.840.1.113883.4.642.2.58\",\"code\":\"urn:va:ien:60:1359:139\",\"display\":\"OCCULT BLOOD\"}]},\"status\":\"final\",\"valueString\":\"POS\",\"reliability\":\"ok\",\"specimen\":{\"reference\":\"#a5b075bf-29f5-4f81-b681-e3df7d7b3c34\",\"display\":\"FECES\"},\"referenceRange\":[{\"high\":{\"value\":null},\"low\":{\"value\":null}}]}],\"identifier\":[{\"system\":\"urn:oid:2.16.840.1.113883.6.233\",\"value\":\"urn:va:lab:9E7A:3:CH;6848977.898489;500027\"}],\"serviceCategory\":{\"text\":\"Chemistry\",\"coding\":[{\"system\":\"http://hl7.org/fhir/v2/0074\",\"code\":\"CH\",\"display\":\"Chemistry\"}]},\"diagnosticDateTime\":\"2015-10-21T10:15:00\",\"specimen\":[{\"reference\":\"#a5b075bf-29f5-4f81-b681-e3df7d7b3c34\",\"display\":\"FECES\"}],\"extension\":[{\"url\":\"http://vistacore.us/fhir/extensions/lab#abnormal\",\"valueBoolean\":false},{\"url\":\"http://vistacore.us/fhir/extensions/lab#categoryCode\",\"valueString\":\"urn:va:lab-category:CH\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#categoryName\",\"valueString\":\"Laboratory\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#displayName\",\"valueString\":\"OCC BLD\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#displayOrder\",\"valueDecimal\":998.0500027},{\"url\":\"http://vistacore.us/fhir/extensions/lab#facilityCode\",\"valueString\":\"500\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#groupName\",\"valueString\":\"URINE 1021 1\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#groupUid\",\"valueString\":\"urn:va:accession:9E7A:3:CH;6848977.898489\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#high\",\"valueString\":\"POS\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#kind\",\"valueString\":\"Laboratory\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#localId\",\"valueString\":\"CH;6848977.898489;500027\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#micro\",\"valueBoolean\":false},{\"url\":\"http://vistacore.us/fhir/extensions/lab#pid\",\"valueString\":\"9E7A;3\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#qualifiedName\",\"valueString\":\"OCCULT BLOOD (FECES)\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#result\",\"valueString\":\"POS\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#specimen\",\"valueString\":\"FECES\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#stampTime\",\"valueString\":\"20151021103500\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#statusCode\",\"valueString\":\"urn:va:lab-status:completed\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#summary\",\"valueString\":\"OCCULT BLOOD (FECES) POS\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#typeId\",\"valueInteger\":1359},{\"url\":\"http://vistacore.us/fhir/extensions/lab#lastUpdateTime\",\"valueString\":\"20151021103500\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#low\",\"valueString\":\"NEG.\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#orderUid\",\"valueString\":\"urn:va:order:9E7A:3:39005\"},{\"url\":\"http://vistacore.us/fhir/extensions/lab#lnccodes[0]\",\"valueString\":\"urn:va:ien:60:1359:139\"}],\"result\":[{\"reference\":\"#4c3fa78f-ef9f-4e65-9690-312be4fd1094\",\"display\":\"OCCULT BLOOD\"}],\"text\":{\"status\":\"generated\",\"div\":\"<div>Collected: 2015-10-21T10:15:00<br/>Report Released: 2015-10-21T10:35:00<br/>Accession: urn:va:accession:9E7A:3:CH;6848977.898489<br/>Test: OCCULT BLOOD<br/>Result: POS<br/>Specimen: FECES<br/>Performing Lab: ALBANY VA MEDICAL CENTER<br/>undefined<br/>undefined<br/></div>\"}}}]}";
        String resultAbnormal = cdsHandler.invokeCDS(LabFHIRResultPos);
        assertNotNull(resultAbnormal);
        assertEquals("Abnormal", resultAbnormal);

    }

}

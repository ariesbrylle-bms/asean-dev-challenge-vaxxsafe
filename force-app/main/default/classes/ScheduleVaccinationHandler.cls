public with sharing class ScheduleVaccinationHandler {
    /* Apex class was chosen to be used for the LWC because of the ff reasons:
     * I need to customize the response that I need for the LWC.
     * I need to filter the records to be returned.
     * I need to customized the saving of record. E.g Name
     * Data comes from different objects
     * Lastly, to further validate the data that I'll be sending and showing to the users.
     */
    
    @AuraEnabled(cacheable=true)
    public static Contact getVaccineeDetails(String contactId) {
        
        try {
            Contact contDetails = [SELECT Id, Name, Age__c ,First_Dose__r.Vaccination_Schedule__r.Date_of_Immunization__c , Vaccine__r.Days_Apart__c, Category__c ,Vaccine__c,Vaccine__r.Name, First_Dose__c , Second_Dose__c  from Contact Where Id = :contactId];
            
            return contDetails;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Vaccination_Schedule__c> getAvailableSchedule(String contactId, Date dateSched) {
        System.debug(contactId);
        System.debug(dateSched);
        try {
            Contact contDetails = [SELECT Id, Name, Age__c , First_Dose__r.Vaccination_Schedule__r.Date_of_Immunization__c , Vaccine__r.Days_Apart__c, Address__c, Category__c ,Vaccine__c,Vaccine__r.Name, First_Dose__c , Second_Dose__c  from Contact Where Id = :contactId];
            
            // get vaccine site group 
            // Vaccination_Site_Address_Group__c 
            List<Vaccination_Site_Address_Group__c> vsaddressGroup = [SELECT Id, Vaccination_Site__c from Vaccination_Site_Address_Group__c WHERE Address__c  = :contDetails.Address__c];
            
            Set<Id> siteId = new Set<Id>();
            for(Vaccination_Site_Address_Group__c vsa : vsaddressGroup){
                siteId.add(vsa.Vaccination_Site__c);
            }
            
            // get Vaccination_Schedule__c based on site available
            List<Vaccination_Schedule__c> vschedule = [SELECT Id, Name, Vaccine__c , Vaccine__r.Name, Date_of_Immunization__c, Eligible_Classification__c ,Target_to_be_Vaccinated__c, Total_of_Scheduled_Vaccinee__c,Vaccination_Site__c, Vaccination_Site__r.Name 
                                                       FROM Vaccination_Schedule__c WHERE Vaccination_Site__c IN :siteId AND Date_of_Immunization__c = :dateSched
                                                      AND Vaccine__c = :contDetails.Vaccine__c AND Eligible_Classification__c includes (:contDetails.Category__c)];
            
            System.debug(vschedule);
            return vschedule;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static String saveSchedule(String contactId, Date dateSched, String dosageSeq , String session , String schedId, string vaccineId) {
     
        try {
            // create record
            Vaccination_History__c vh = new Vaccination_History__c();
            vh.Dosage_Sequence__c = dosageSeq;
            vh.Session__c = session;
            vh.Name = dosageSeq + ' - ' + String.valueOf(dateSched);
            vh.Vaccination_Schedule__c = schedId;
            vh.Vaccine__c = vaccineId;
            vh.Vaccinee__c = contactId;
            
            insert vh;
            
            Contact vaccinee = [Select Id, First_Dose__c, Second_Dose__c FROM Contact WHERE Id = :contactId];
            
            if (dosageSeq == 'First Dose'){
                vaccinee.First_Dose__c = vh.Id;
                vaccinee.Level__c = 'For First Dose';
            }else{
                vaccinee.Second_Dose__c = vh.Id;
            }
            
            update vaccinee;
            // update contact
            return 'Schedule has been successfully set.';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
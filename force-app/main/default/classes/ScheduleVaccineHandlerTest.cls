@isTest
public class ScheduleVaccineHandlerTest {
	 @testSetup static void setup() {
        // create address
        Address__c add = new Address__c();
        add.Barangay__c	=	'Commonwealth'	;
        add.City_Municipality__c	=	'QUEZON CITY'	;
        add.Name	=	'Commonwealth, QUEZON CITY, NCR, SECOND DISTRICT NCR'	;
        add.Province__c	=	'NCR, SECOND DISTRICT'	;
        add.Region__c	=	'NCR'	;
        
        insert add;
         
        // vaccine
        Vaccine__c vacc = new Vaccine__c();
        vacc.Age_Group_Covered__c	=	'12 y/o and above'	;
        vacc.Clinical_Trial_Phase__c	=	'Phase 3'	;
        vacc.Days_Apart__c	=	21	;
        vacc.Dose_and_Frequency__c	=	'2 doses, 21 days apart'	;
        vacc.Name	=	'Pfizer-BioNTech'	;
        vacc.Storage_Requirements__c	=	'-80c to -60c'	;
        vacc.Technology_Platform__c	=	'mRNA'	;
         
        insert vacc;
         
        // vaccination site
        Vaccination_Site__c vacc_site = new Vaccination_Site__c();
        vacc_site.Building__c	=	'Barangay Hall';
        vacc_site.Name	=	'Commonwealth - Barangay Hall';
        vacc_site.Street__c	=	'Mangahan';
         
        insert vacc_site;
         
        // vaccination site address group
        Vaccination_Site_Address_Group__c vacc_site_ag = new Vaccination_Site_Address_Group__c();
        vacc_site_ag.Address__c	=	add.Id	;
		vacc_site_ag.Vaccination_Site__c	=	vacc_site.Id	;
        
         insert vacc_site_ag;
        // municipality
        Account mun = new Account();
        mun.Classification__c	=	'Class 1'	;
		mun.Population__c	=	5000000	;
        mun.Name = 'QC';
         
        insert mun;
         
        // contact health worker
        Contact hw = new Contact();
        hw.AccountId	=	mun.Id	;
        hw.Address__c	=	add.Id	;
        hw.Birthdate	=	Date.valueOf('1958-10-08')	;
        hw.Category__c	=	'01 – Health Care Worker'	;
        hw.Civil_Status__c	=	'Married'	;
        hw.Email	=	'a01sample@yopmail.com'	;
        hw.FirstName	=	'Kaylie'	;
        hw.LastName	=	'Hawes'	;
        hw.Level__c	=	'Encoded'	;
        hw.Provided_electronic_informed_consent_for__c	=	'Yes'	;
        hw.Provided_initial_consent_for_vaccination__c	=	'Yes'	;
        hw.Sex__c	=	'Female'	;
        hw.Vaccine__c	=	vacc.Id	;
		
         insert hw;
        // contact vaccinee
        Contact vaccineex = new Contact();
        vaccineex.AccountId	=	mun.Id	;
        vaccineex.Address__c	=	add.Id	;
        vaccineex.Birthdate	=	Date.valueOf('1958-10-08')	;
        vaccineex.Category__c	=	'01 – Health Care Worker'	;
        vaccineex.Civil_Status__c	=	'Married'	;
        vaccineex.Email	=	'a02sample@yopmail.com'	;
        vaccineex.FirstName	=	'Kaylies'	;
        vaccineex.LastName	=	'Hawess'	;
        vaccineex.Level__c	=	'Encoded'	;
        vaccineex.Provided_electronic_informed_consent_for__c	=	'Yes'	;
        vaccineex.Provided_initial_consent_for_vaccination__c	=	'Yes'	;
        vaccineex.Sex__c	=	'Female'	;
        vaccineex.Vaccine__c	=	vacc.Id	;
         
        insert vaccineex;
        
        // vaccination schedule
        Vaccination_Schedule__c vsched = new Vaccination_Schedule__c();
        vsched.Date_of_Immunization__c	=	Date.valueOf('2021-10-17')	;
        vsched.Eligible_Classification__c	=	'01 – Health Care Worker;02 – Senior Citizen;03 – Indigent;04 – Uniformed Personnel;05 – Essential Worker'	;
        vsched.No_of_Safety_Collector_Boxes__c	=	2	;
        vsched.No_of_Syringes__c	=	600	;
        vsched.No_of_Vaccine_Carrier__c	=	5	;
        vsched.No_of_Vaccine_Ice_Packs__c	=	2	;
        vsched.No_of_Vaccines__c	=	500	;
        vsched.Target_to_be_Vaccinated__c	=	500	;
        vsched.Vaccination_Site__c	=	vacc_site.Id	;
        vsched.Vaccine__c	=	vacc.Id	;
         
        insert vsched;
         
        // vaccine history
        Vaccination_History__c vhistory = new Vaccination_History__c();
        vhistory.Dosage_Sequence__c	=	'First Dose'	;
        vhistory.Name	=	'First Dose - 2021-10-17'	;
        vhistory.Session__c	=	'AM'	;
        vhistory.Vaccination_Schedule__c	=	vsched.Id	;
        vhistory.Vaccine__c	=	vacc.Id	;
        vhistory.Vaccinee__c	=	vaccineex.Id;
         
         insert vhistory;
    }
    
    @isTest static void getVaccineeDetails() {
        Contact c = [SELECT Id from Contact where EMAIL = 'a02sample@yopmail.com'];
        Test.startTest();
        Contact res = ScheduleVaccinationHandler.getVaccineeDetails(c.Id);
        Test.stopTest();
        
        System.assertEquals(res.Id,c.Id);
    }
    
    @isTest static void getAvailableSchedule() {
        Contact c = [SELECT Id from Contact where EMAIL = 'a02sample@yopmail.com'];
        Test.startTest();
        List<Vaccination_Schedule__c> sched = ScheduleVaccinationHandler.getAvailableSchedule(c.Id, Date.valueOf('2021-10-17'));
        Test.stopTest();
        
        System.assertEquals(sched.size(),1);
    }
    
    //
    @isTest static void saveSchedule() {
        Contact c = [SELECT Id, Vaccine__c from Contact where EMAIL = 'a02sample@yopmail.com'];
        Vaccination_Schedule__c vsched = [SELECT Id from Vaccination_Schedule__c WHERE Date_of_Immunization__c = :Date.valueOf('2021-10-17')];
        Test.startTest();
        String res = ScheduleVaccinationHandler.saveSchedule(c.Id, Date.valueOf('2021-10-17'), 'First Dose' , 'AM' , vsched.Id, c.Vaccine__c);
        Test.stopTest();
        
        System.assertEquals(res,'Schedule has been successfully set.');
    }
}
/* eslint-disable no-eval */
/* eslint-disable consistent-return */
/* eslint-disable vars-on-top */
import { LightningElement, api, wire } from "lwc";
import { CloseActionScreenEvent } from "lightning/actions";
import getVaccineeDetails from "@salesforce/apex/ScheduleVaccinationHandler.getVaccineeDetails";
import getAvailableSchedule from "@salesforce/apex/ScheduleVaccinationHandler.getAvailableSchedule";
import saveSchedule from "@salesforce/apex/ScheduleVaccinationHandler.saveSchedule";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class ScheduleVaccination extends LightningElement {
  /* I chose LWC for the the creating vaccine schedule because of the following:
   * I need to customize the display, components to be shown because these are from different objects
   * I need to further filter data that I'll be showing to the users
   * I need to validate the data that will be sent to the server
   * Lastly, to have a better user interface and user experience
   */

  @api recordId;

  name = "";
  age = "";
  category = "";
  vaccine = "";
  dose = "";
  schedule_date = "";
  session = "AM";
  schedule_options = [];
  schedule_value = "";
  vaccineId = "";
  disableSubmit = false;

  get options() {
    return [
      { label: "Morning", value: "AM" },
      { label: "Afternoon", value: "PM" }
    ];
  }

  closeAction() {
    this.dispatchEvent(new CloseActionScreenEvent());
  }

  @wire(getVaccineeDetails, {
    contactId: "$recordId"
  })
  getVaccineeDetails(result) {
    console.log(result);
    var days;
    var future;
    var finalDate;
    try {
      if (typeof result.data != "undefined") {
        this.name = result.data.Name;
        this.age =
          typeof result.data.Age__c != "undefined" ? result.data.Age__c : "";
        this.category = result.data.Category__c;
        this.vaccine =
          typeof result.data.Vaccine__c != "undefined"
            ? result.data.Vaccine__r.Name
            : "";
        this.dose =
          typeof result.data.First_Dose__c != "undefined"
            ? "Second Dose"
            : "First Dose";
        this.vaccineId =
          typeof result.data.Vaccine__c != "undefined"
            ? result.data.Vaccine__c
            : "";
        days =
          typeof result.data.First_Dose__c != "undefined"
            ? result.data.Vaccine__r.Days_Apart__c
            : 7;
        future = new Date(); // get today date
        future.setDate(future.getDate() + days); // add 7 days
        finalDate =
          future.getFullYear() +
          "-" +
          (future.getMonth() + 1 < 10 ? "0" : "") +
          (future.getMonth() + 1) +
          "-" +
          future.getDate();
        console.log(finalDate);

        this.schedule_date = finalDate;
        console.log(this.schedule_date);
      }
    } catch (error) {
      console.log(error);
    }
  }

  handleDateChange(event) {
    this.schedule_date = event.target.value;
    this.getAvailableScheduleFunc();
  }

  handleSessionChange(event) {
    this.session = event.target.value;
  }

  handleSchedChange(event) {
    this.schedule_value = event.target.value;
  }

  saveScheduleFunc() {
    if (this.schedule_value === "") {
      return this.showToast("", "Please select schedule.", "warning");
    }
    this.disableSubmit = true;

    saveSchedule({
      contactId: this.recordId,
      dateSched: this.schedule_date,
      dosageSeq: this.dose,
      session: this.session,
      schedId: this.schedule_value,
      vaccineId: this.vaccineId
    })
      .then((result) => {
        console.log(result);
        this.showToast("", result, "success");
        this.closeAction();
        eval("$A.get('e.force:refreshView').fire();");
      })
      .catch((error) => {
        console.log("Error: " + error);
        this.showToast(
          "",
          "An error has been encountered. Please contact your System Administrator.",
          "error"
        );
      });
  }

  getAvailableScheduleFunc() {
    getAvailableSchedule({
      contactId: this.recordId,
      dateSched: this.schedule_date
    })
      .then((result) => {
        var options = [];

        result.forEach((element) => {
          if (
            element.Total_of_Scheduled_Vaccinee__c <
            element.Target_to_be_Vaccinated__c
          ) {
            var lbl =
              typeof element.Vaccination_Site__c != "undefined"
                ? element.Vaccination_Site__r.Name
                : "";
            options.push({
              label:
                element.Name +
                " - " +
                lbl +
                " (" +
                element.Total_of_Scheduled_Vaccinee__c +
                " / " +
                element.Target_to_be_Vaccinated__c +
                ") ",
              value: element.Id
            });
          }
        });
        this.schedule_options = options;

        console.log(this.session);
        console.log(result);
      })
      .catch((error) => {
        console.log("Error: " + error);
      });
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      variant: variant,
      title: title,
      message: message
    });
    this.dispatchEvent(event);
  }
}

/* eslint-disable jest/expect-expect */
/* eslint-disable @lwc/lwc/no-document-query */
/* eslint-disable import/named */
import { createElement } from "lwc";
import ScheduleVaccination from "c/scheduleVaccination";
import { CloseScreenEventName } from "lightning/actions";
import getVaccineeDetails from "@salesforce/apex/ScheduleVaccinationHandler.getVaccineeDetails";
import getAvailableSchedule from "@salesforce/apex/ScheduleVaccinationHandler.getAvailableSchedule";
import saveSchedule from "@salesforce/apex/ScheduleVaccinationHandler.saveSchedule";

const mockGetVaccineeData = require("./data/vaccinee.json");
const mockScheduleData = require("./data/availableSched.json");

const RECORD_ID = "0035j00000213x8AAA";

// Mock Apex wire adapter
jest.mock(
  "@salesforce/apex/ScheduleVaccinationHandler.saveSchedule",
  () => {
    const { createApexTestWireAdapter } = require("@salesforce/sfdx-lwc-jest");
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/ScheduleVaccinationHandler.getVaccineeDetails",
  () => {
    const { createApexTestWireAdapter } = require("@salesforce/sfdx-lwc-jest");
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/ScheduleVaccinationHandler.getAvailableSchedule",
  () => {
    const { createApexTestWireAdapter } = require("@salesforce/sfdx-lwc-jest");
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

describe("c-schedule-vaccination", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    // Prevent data saved on mocks from leaking between tests
    jest.clearAllMocks();
  });

  async function flushPromises() {
    return Promise.resolve();
  }

  describe("API Calls", () => {
    it("gets called with data from recordId", async () => {
      // Create initial element
      const element = createElement("c-schedule-vaccination", {
        is: ScheduleVaccination
      });
      document.body.appendChild(element);
      element.recordId = RECORD_ID;
      getVaccineeDetails.emit(mockGetVaccineeData);

      // Wait for any asynchronous DOM updates
      await flushPromises();
      expect(getVaccineeDetails.getLastConfig().contactId).toEqual(
        mockGetVaccineeData.data.Id
      );
    });

    it("get schedule", async () => {
      // Create initial element
      const element = createElement("c-schedule-vaccination", {
        is: ScheduleVaccination
      });
      document.body.appendChild(element);

      element.recordId = RECORD_ID;
      element.dateSched = "2021-11-07";
      element.schedule_date = "2021-11-07";

      getAvailableSchedule.emit(mockScheduleData);
      await flushPromises();
    });
  });

  it("Handle cancel Button", async () => {
    // Create initial element
    const element = createElement("c-schedule-vaccination", {
      is: ScheduleVaccination
    });
    document.body.appendChild(element);

    const handler = jest.fn();
    element.addEventListener(CloseScreenEventName, handler);

    // Find the cancel button and click
    const inputEl = element.shadowRoot.querySelectorAll("button");
    inputEl[0].click();
  });

  it("Handle Date Change", async () => {
    // Create initial element
    getAvailableSchedule.mockResolvedValue(mockScheduleData);
    const element = createElement("c-schedule-vaccination", {
      is: ScheduleVaccination
    });
    document.body.appendChild(element);

    const inputEl = element.shadowRoot.querySelectorAll("lightning-input");
    inputEl[0].value = "2021-01-01";
    inputEl[0].dispatchEvent(new CustomEvent("change"));

    expect(getAvailableSchedule.mock.calls.length).toBe(1);
  });

  it("Handle Session Change", async () => {
    // Create initial element
    const element = createElement("c-schedule-vaccination", {
      is: ScheduleVaccination
    });
    document.body.appendChild(element);
    const inputEl = element.shadowRoot.querySelectorAll("lightning-combobox");
    inputEl[0].value = "PM";
    inputEl[0].dispatchEvent(new CustomEvent("change"));
    expect(inputEl[0].value).toBe("PM");
  });

  it("Handle Sched Change", async () => {
    // Create initial element
    const element = createElement("c-schedule-vaccination", {
      is: ScheduleVaccination
    });
    document.body.appendChild(element);
    const inputEl = element.shadowRoot.querySelectorAll("lightning-combobox");
    inputEl[1].value = null;
    inputEl[1].dispatchEvent(new CustomEvent("change"));
    expect(inputEl[1].value).toBe(null);
  });

  it("Handle Save Change", async () => {
    // Create initial element
    saveSchedule.mockResolvedValue("Success");
    const element = createElement("c-schedule-vaccination", {
      is: ScheduleVaccination
    });
    document.body.appendChild(element);
    const inputEl = element.shadowRoot.querySelectorAll("lightning-combobox");
    inputEl[1].value = "A";
    inputEl[1].dispatchEvent(new CustomEvent("change"));

    element.schedule_value = "A";
    const inputEl2 = element.shadowRoot.querySelectorAll("button");
    inputEl2[1].click();
    expect(saveSchedule.mock.calls.length).toBe(1);
  });
});

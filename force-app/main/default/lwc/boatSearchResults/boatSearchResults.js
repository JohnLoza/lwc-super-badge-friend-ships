import { LightningElement, wire } from 'lwc';

import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
  selectedBoatId = '';
  columns = [];
  boatTypeId = '';
  boats;
  isLoading = false;

  // wired message context
  // wired getBoats method
  @wire(MessageContext) messageContext;
  @wire(getBoats, { boatTypeId: "$boatTypeId" })
  wiredBoats(result) {
    this.boats = result;
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  }

  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  searchBoats(boatTypeId) {
    this.isLoading = true
    this.notifyLoading(this.isLoading);
    this.boatTypeId = boatTypeId;
  }

  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  refresh() { }

  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail;
    this.sendMessageService(this.selectedBoatId);
  }

  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) {
    // explicitly pass boatId to the parameter recordId
    publish(this.messageContext, BOATMC, boatId);
  }

  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    // notify loading
    const updatedFields = event.detail.draftValues;
    // Update the records via Apex
    updateBoatList({ data: updatedFields })
      .then(() => { })
      .catch(error => { })
      .finally(() => { });
  }

  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    const loadingEvent = isLoading ? new CustomEvent('loading') : new CustomEvent('doneloading');
    this.dispatchEvent(loadingEvent);
  }
}

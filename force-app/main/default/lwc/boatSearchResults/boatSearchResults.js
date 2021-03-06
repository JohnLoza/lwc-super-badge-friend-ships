import { LightningElement, api, wire } from 'lwc';

import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { refreshApex } from '@salesforce/apex';

import { publish, MessageContext } from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
  selectedBoatId = '';
  columns = [
    { label: 'Name', fieldName: 'Name', editable: true },
    { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
    { label: 'Description', fieldName: 'Description__c', editable: true }
  ];
  boatTypeId = '';
  boats;
  isLoading = false;

  // wired message context
  // wired getBoats method
  @wire(MessageContext) messageContext;
  @wire(getBoats, { boatTypeId: "$boatTypeId" })
  wiredBoats(result) {
    this.notifyLoading(false);
    this.boats = result;
  }

  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) {
    this.notifyLoading(true);
    this.boatTypeId = boatTypeId;
  }

  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  async refresh() {
    this.notifyLoading(true)
    await refreshApex(this.boats);
    this.notifyLoading(false);
  }

  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }

  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) {
    // explicitly pass boatId to the parameter recordId
    const recordId = { recordId: boatId };
    publish(this.messageContext, BOATMC, recordId);
  }

  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    // notify loading
    this.notifyLoading(true)
    const updatedFields = event.detail.draftValues;
    // Update the records via Apex
    updateBoatList({ data: updatedFields })
      .then((data) => {
        this.refresh();
        this.dispatchSuccessToast();
      })
      .catch(error => this.dispatchErrorToast(error))
      .finally(() => this.notifyLoading(false));
  }

  dispatchSuccessToast() {
    return this.dispatchEvent(
      new ShowToastEvent({
        title: SUCCESS_TITLE,
        message: MESSAGE_SHIP_IT,
        variant: SUCCESS_VARIANT,
        mode: 'dismissable'
      })
    );
  }

  dispatchErrorToast(error) {
    return this.dispatchEvent(
      new ShowToastEvent({
        title: ERROR_TITLE,
        message: error.body.message,
        variant: ERROR_VARIANT,
        mode: 'dismissable'
      })
    );
  }

  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    this.isLoading = isLoading;
    const loadingEvent = isLoading ? new CustomEvent('loading') : new CustomEvent('doneloading');
    this.dispatchEvent(loadingEvent);
  }
}

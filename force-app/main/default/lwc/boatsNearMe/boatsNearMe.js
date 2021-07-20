// imports
import { LightningElement, wire, api } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';

export default class BoatsNearMe extends LightningElement {
  @api boatTypeId;
  mapMarkers = [];
  isLoading = true;
  isRendered;
  latitude;
  longitude;

  // Add the wired method from the Apex Class
  // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  // Handle the result and calls createMapMarkers
  @wire(getBoatsByLocation, { latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId' })
  wiredBoatsJSON({ error, data }) {
    if (data) {
      this.createMapMarkers(JSON.parse(data));
    } else if (error) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: ERROR_TITLE,
          message: error.message,
          variant: ERROR_VARIANT,
          mode: 'dismissable'
        })
      );
    }
    this.isLoading = false;
  }

  // Controls the isRendered property
  // Calls getLocationFromBrowser()
  renderedCallback() {
    if (!this.isRendered) {
      this.getLocationFromBrowser();
    }
    // sets to true once the location is fetched
    this.isRendered = true;
  }

  // Gets the location from the Browser
  // position => {latitude and longitude}
  getLocationFromBrowser() {
    const options = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 0
    };

    if (navigator.geolocation) {
      // accessing getCurrentPosition method
      navigator.geolocation.getCurrentPosition(position => {
        // success callback
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      }, (error) => {
        console.error(error.message);
      }, options);
    }
  }

  // Creates the map markers
  createMapMarkers(boatData) {
    // const newMarkers = boatData.map(boat => {...});
    const newMarkers = boatData.map(boat => {
      return {
        title: boat.Name,
        location: {
          Latitude: boat.Geolocation__Latitude__s,
          Longitude: boat.Geolocation__Longitude__s
        }
      }
    });

    newMarkers.unshift({
      title: LABEL_YOU_ARE_HERE,
      icon: ICON_STANDARD_USER,
      location: { Latitude: this.latitude, Longitude: this.longitude }
    });

    this.mapMarkers = newMarkers;
  }
}

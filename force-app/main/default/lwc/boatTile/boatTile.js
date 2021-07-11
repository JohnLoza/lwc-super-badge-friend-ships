// imports
import { LightningElement, api } from 'lwc';

export default class BoatTile extends LightningElement {
  @api
  boat;

  @api
  selectedBoatId;

  TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
  TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper';

  // Getter for dynamically setting the background image for the picture
  get backgroundStyle() {
    return `background-image:url("${this.boat.Picture__c}")`;
  }

  // Getter for dynamically setting the tile class based on whether the
  // current boat is selected
  get tileClass() {
    return this.selectedBoatId === this.boat.Id ?
      this.TILE_WRAPPER_SELECTED_CLASS : this.TILE_WRAPPER_UNSELECTED_CLASS;
  }

  // Fires event with the Id of the boat that has been selected.
  selectBoat() {
    const boatSelectEvent = new CustomEvent('boatselect', {
      detail: this.boat.Id
    });
    this.dispatchEvent(boatSelectEvent);
  }
}

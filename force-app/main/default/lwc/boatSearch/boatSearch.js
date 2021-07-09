import { LightningElement } from 'lwc';

export default class BoatSearch extends LightningElement {
  boatTypeComboValue = 'all_types';

  get boatTypeComboOptions() {
    return [
      { label: 'All Types', value: 'all_types' },
      { label: 'Recreational', value: 'recreational' },
      { label: 'Profesional', value: 'profesional' }
    ];
  }

  handleNewBoatClick() { }

  handleBoatTypeChange(event) { }
}

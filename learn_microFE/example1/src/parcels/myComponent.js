import React from 'react';
import ReactDom from 'react-dom';
import Parcel from 'single-spa-react/parcel';
import { MyParcel } from './myParcel.js';

export class myComponent extends React.Component {
	render() {
		return (
			<Parcel
				config={MyParcel}
				
			/>
		)
	}
}
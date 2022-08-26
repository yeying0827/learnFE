import React from 'react';
import ReactDom from 'react-dom';
import singleSpaReact from 'single-spa-react';
import MyParcelComponent from './my-parcel-component.component.js';
export const MyParcel = singleSpaReact({
	React,
	ReactDom,
	rootComponent: MyParcelComponent
});
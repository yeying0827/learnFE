import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";

function ContactDomFn (props) {
	console.log(112233);
	console.log('ContactDomFn', props);
	return (
		<div>
			<p>联系人：张三</p>
			<p>联系电话：057188889999</p>
		</div>
	)
}

const ContactDom = singleSpaReact({
	React,
	ReactDOM,
	rootComponent: ContactDomFn
});

export default ContactDom;
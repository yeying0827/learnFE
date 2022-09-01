import ContactParcel from './parcels/contact';
import Parcel from 'single-spa-react/parcel';

export default function Root(props) {

  return (
    <section>
      {props.name} is mounted!
      <Parcel
        config={ContactParcel}
        wrapWith="section"
        /*appendTo={document.body} 使用存在问题*/
        />
    </section>
  );
}

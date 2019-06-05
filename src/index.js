import { Header } from './app/header';
import '../src/style.css';

let header = new Header();
let firstHeading = header.getFirstHeading();
console.log(firstHeading);
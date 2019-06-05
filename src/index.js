import { Header } from './app/header';
import '../src/style.css';
import '../src/calendar.js';

let header = new Header();
let firstHeading = header.getFirstHeading();
console.log(firstHeading);
import { registerLocale, setDefaultLocale } from "react-datepicker";
import tr from "date-fns/locale/tr";

const trMonday = { ...tr, options: { ...tr.options, weekStartsOn: 1 } };
registerLocale("tr-monday", trMonday);
setDefaultLocale("tr-monday");
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Hash,
  Clock,
  FileInputIcon,
  Lock,
} from "lucide-react";

import TextInput from "../inputs/TextInput";
import EmailInput from "../inputs/EmailInput";
import NumberInput from "../inputs/NumberInput";
import TextArea from "../inputs/TextArea";
import Select from "../inputs/Select";
import Checkbox from "../inputs/CheckBox";
import RadioButton from "../inputs/RadioButton";
import DateInput from "../inputs/DateInput";
import TimeInput from "../inputs/TimeInput";
import FileInput from "../inputs/FileInput";
import PasswordInput from "../inputs/PasswordInput";

export const INPUT_COMPONENTS = {
  text: TextInput,
  email: EmailInput,
  number: NumberInput,
  textarea: TextArea,
  select: Select,
  checkbox: Checkbox,
  radio: RadioButton,
  date: DateInput,
  time: TimeInput,
  file: FileInput,
  password: PasswordInput,
};

export const INPUT_ICONS = {
  text: User,
  email: Mail,
  number: FileText,
  textarea: FileText,
  phone: Phone,
  address: MapPin,
  date: Calendar,
  time: Clock,
  file: FileInputIcon,
  password: Lock,
  id: Hash,
};

// src/boot/v-calendar.ts
import { defineBoot } from '#q-app/wrappers';
import VCalendar from 'v-calendar';
import 'v-calendar/style.css';

export default defineBoot(({ app }) => {
    app.use(VCalendar, {});
});
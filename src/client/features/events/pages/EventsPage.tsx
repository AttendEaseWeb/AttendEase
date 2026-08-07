import React from 'react';
import { ClassesPage } from './ClassesPage';

export const EventsPage: React.FC<{ onOpenQRScanner: () => void }> = (props) => {
  return <ClassesPage {...props} />;
};

export default EventsPage;

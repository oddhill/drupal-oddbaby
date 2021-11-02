export interface Event {
  color?: string;
  date: Date;
  location: string;
  title: string;
  description: string;
  tag?: string;
}

export const events: Event[] = [
  {
    color: '#FFD078',
    date: new Date('2021-10-20 08:30'),
    location: 'Malmö',
    title: 'Sup race',
    description: 'En del av Svenska Sup Race Serien',
    tag: 'Tävling',
  },
  {
    color: '#EB6767',
    date: new Date('2021-10-22 11:00'),
    location: 'Lomma',
    title: 'Barnpaddling med chill & grill',
    description: 'Paddla och lite chill and grill',
    tag: 'Chill & Grill',
  },
  {
    date: new Date('2021-11-13 11:00'),
    location: 'Lomma',
    title: 'Klubbdag',
    description: 'SM planering',
  },
  {
    color: '#EB6767',
    date: new Date('2022-01-22 11:00'),
    location: 'Lomma',
    title: 'Barnpaddling med chill & grill',
    description: 'Paddla och lite chill and grill',
    tag: 'Chill & Grill',
  },
  {
    date: new Date('2022-02-20 11:00'),
    location: 'Lomma',
    title: 'Klubbdag',
    description: 'SM planering',
  },
  {
    color: '#7ACC4F',
    date: new Date('2022-02-20 11:00'),
    location: 'Lomma',
    title: 'SM i 100 meter sprint',
    description: 'En del av Svenska Sup Race Serien',
    tag: 'Träning',
  },
];

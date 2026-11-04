
export interface PropertyItem {
  id: number;
  city: string;
  title: string;
  image: string;
  yield: string;
  price: string;
  roi: string;
}
export function createProperties(count: number): PropertyItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    city: 'New York city',
    title: 'Executive Residences',
    image: '/images/home/building.png',
    yield: '5.32%',
    price: '$1230',
    roi: '12%',
  }));
}

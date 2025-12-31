
export interface WardInfo {
  id: string;
  name: string;
  councillor: string;
  office: string;
  email: string;
}

export const WARDS: WardInfo[] = [
  { id: 'w1', name: 'Koramangala (Ward 151)', councillor: 'Sri. Ramesh Reddy', office: 'Koramangala BBMP Office, 8th Block', email: 'councillor.kora@bbmp.gov.in' },
  { id: 'w2', name: 'Indiranagar (Ward 80)', councillor: 'Smt. Priya Sharma', office: 'Indiranagar 100ft Rd Office', email: 'councillor.indira@bbmp.gov.in' },
  { id: 'w3', name: 'Jayanagar (Ward 153)', councillor: 'Sri. Suresh Kumar', office: 'Jayanagar 4th Block BBMP Building', email: 'councillor.jaya@bbmp.gov.in' },
  { id: 'w4', name: 'Whitefield (Ward 84)', councillor: 'Smt. Anjali Rao', office: 'Whitefield Main Rd, Near Hope Farm', email: 'councillor.wf@bbmp.gov.in' },
  { id: 'w5', name: 'Malleshwaram (Ward 65)', councillor: 'Sri. Venkatesh Prasad', office: 'Malleshwaram 15th Cross Office', email: 'councillor.malles@bbmp.gov.in' },
  { id: 'w6', name: 'HSR Layout (Ward 174)', councillor: 'Smt. Meera Hegde', office: 'HSR Layout Sector 2, BBMP Park', email: 'councillor.hsr@bbmp.gov.in' },
  { id: 'w7', name: 'BTM Layout (Ward 176)', councillor: 'Sri. Ravi Gowda', office: 'BTM 2nd Stage, Near Lake', email: 'councillor.btm@bbmp.gov.in' },
  { id: 'w8', name: 'Rajajinagar (Ward 99)', councillor: 'Smt. Savitha Murthy', office: 'Rajajinagar 3rd Block Complex', email: 'councillor.rajaji@bbmp.gov.in' },
  { id: 'w9', name: 'Basavanagudi (Ward 154)', councillor: 'Sri. Krishna Murari', office: 'Basavanagudi Circle BBMP Office', email: 'councillor.basava@bbmp.gov.in' },
  { id: 'w10', name: 'Hebbal (Ward 22)', councillor: 'Smt. Anita Deshmukh', office: 'Hebbal Flyover Junction Office', email: 'councillor.hebbal@bbmp.gov.in' }
];

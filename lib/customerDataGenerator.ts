/**
 * Customer Data Generator
 * Generates consistent sample customer data using seeded random generation
 */

// Simple seeded random number generator for consistent results
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    // Convert string to number seed
    this.seed = seed.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
  }

  next(): number {
    // Linear congruential generator with better parameters
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(array: T[]): T {
    if (!array || array.length === 0) {
      throw new Error('Cannot choose from empty array');
    }
    const randomValue = this.next();
    const index = Math.floor(randomValue * array.length);
    // Ensure index is within bounds
    const safeIndex = Math.max(0, Math.min(index, array.length - 1));
    const result = array[safeIndex];
    if (result === undefined) {
      throw new Error(`Array access returned undefined at index ${safeIndex} of ${array.length}`);
    }
    return result;
  }
}

// Nigerian names pool
const NIGERIAN_NAMES = [
  'Ademola Jumoke',
  'Adegboyoga Precious',
  'Nneka Chukwu',
  'Damilare Usman',
  'Jide Kosoko',
  'Oladeji Israel',
  'Eze Chinedu',
  'Adebanji Bolaji',
  'Baba Kaothat',
  'Adebayo Salami',
  'Chioma Okafor',
  'Emeka Nwosu',
  'Folake Adeyemi',
  'Gbenga Ogunleye',
  'Halima Bello',
  'Ibrahim Musa',
  'Jumoke Adeyemi',
  'Kemi Adetiba',
  'Lanre Hassan',
  'Maryam Abacha',
  'Ngozi Okonjo',
  'Obinna Nwankwo',
  'Patience Ozokwor',
  'Quadri Adewale',
  'Rasheed Gbadamosi',
  'Sade Okoya',
  'Tunde Bakare',
  'Uche Jombo',
  'Victor Olatunji',
  'Wale Adenuga',
  'Yemi Alade',
  'Zainab Balogun',
  'Akin Alabi',
  'Bisola Aiyeola',
  'Chidi Mokeme',
  'Desmond Elliot',
  'Ebuka Obi-Uchendu',
  'Funke Akindele',
  'Genevieve Nnaji',
  'Hakeem Olajuwon',
  'Ini Edo',
  'John Okafor',
  'Kunle Afolayan',
  'Lateef Adedimeji',
  'Mercy Johnson',
  'Nkem Owoh',
  'Olu Jacobs',
  'Pete Edochie',
  'Queen Nwokoye',
  'Ramsey Nouah',
  'Segun Arinze',
  'Toyin Abraham',
  'Usman Baba',
  'Victoria Inyama',
  'Wunmi Mosaku',
  'Yul Edochie',
  'Zubby Michael',
  'Adesua Etomi',
  'Banky Wellington',
  'Chiwetel Ejiofor',
  'Don Jazzy',
  'Ebenezer Obey',
  'Fela Kuti',
  'Goodluck Jonathan',
  'Helen Paul',
  'Iyabo Ojo',
  'Jay Jay Okocha',
  'Kanu Nwankwo',
  'Linda Ikeji',
  'Mikel Obi',
  'Nollywood Star',
  'Osita Iheme',
  'Paul Okoye',
  'Rita Dominic',
  'Stella Damasus',
  'Tiwa Savage',
  'Uzo Aduba',
  'Wizkid Ayo',
  'Yinka Ayefele',
  'Zlatan Ibile',
  'Adaeze Yobo',
  'Basketmouth Okpocha',
  'Chika Ike',
  'Davido Adeleke',
  'Eucharia Anunobi',
  'Flavour Nabania',
  'Genevieve Nnaji',
  'Hilda Dokubo',
  'Ikechukwu Uche',
  'Jennifer Eliogu',
  'Kate Henshaw',
  'Liz Benson',
  'Monalisa Chinda',
  'Nse Ikpe-Etim',
  'Omotola Jalade',
  'Patience Ozokwor',
  'Queen Latifah',
  'Rukky Sanda',
  'Stephanie Okereke',
  'Tonto Dikeh'
];

const EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'aol.com',
  'mac.com',
  'live.com',
  'msn.com',
  'me.com',
  'icloud.com'
];

export interface Customer {
  id: string;
  customerId: string;
  name: string;
  status: 'Active' | 'Scheduled';
  phoneNumber: string;
  email: string;
  dateJoined: string;
}

/**
 * Generate consistent customer data
 * @param count Number of customers to generate (default: 100)
 * @param seed Optional seed for consistent generation (default: 'customers')
 */
export function generateCustomers(count: number = 100, seed: string = 'customers'): Customer[] {
  if (NIGERIAN_NAMES.length === 0) {
    throw new Error('NIGERIAN_NAMES array is empty');
  }
  
  const rng = new SeededRandom(seed);
  const customers: Customer[] = [];

  for (let i = 0; i < count; i++) {
    // Get a random name (duplicates are allowed, which is realistic)
    const name = rng.choice(NIGERIAN_NAMES);
    
    if (!name) {
      throw new Error(`Failed to generate name for customer ${i + 1}`);
    }

    // Generate 5-digit customer ID (always unique)
    const customerIdNumber = rng.nextInt(10000, 99999);
    const customerId = `ID: ${customerIdNumber}`;

    // Generate status (90% Active, 10% Scheduled)
    const status: 'Active' | 'Scheduled' = rng.next() < 0.9 ? 'Active' : 'Scheduled';

    // Generate Nigerian phone number (+234 XXX XXX XXXX)
    const phoneNumber = `+234 ${rng.nextInt(800, 909)} ${rng.nextInt(100, 999)} ${rng.nextInt(1000, 9999)}`;

    // Generate email from name
    const emailPrefix = name.toLowerCase().replace(/\s+/g, '');
    // Add a number to make emails unique
    const email = `${emailPrefix}${i + 1}@${rng.choice(EMAIL_DOMAINS)}`;

    // Generate date within past 2 years
    const daysAgo = rng.nextInt(1, 730);
    const dateJoined = new Date();
    dateJoined.setDate(dateJoined.getDate() - daysAgo);

    // Format date as "MMM DD, YYYY"
    const formattedDate = formatDate(dateJoined);

    customers.push({
      id: `customer-${i + 1}`,
      customerId,
      name,
      status,
      phoneNumber,
      email,
      dateJoined: formattedDate
    });
  }

  return customers;
}

/**
 * Format date as "MMM DD, YYYY"
 */
function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 
                  'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Hash a string to a number for seeding
 */
export function hashString(str: string): number {
  return str.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
}

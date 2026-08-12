import { Injectable, signal } from '@angular/core';
import { daysAgo } from '../../shared/mock/mock';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  location: string;
  avatarSeed: string;
  tags: string[];
  favorite: boolean;
  lastContacted: string;
}

const SEED: readonly Omit<Contact, 'id' | 'avatarSeed' | 'lastContacted'>[] = [
  { name: 'Ada Lovelace', email: 'ada@analytical.co', phone: '+44 20 7946 0101', company: 'Analytical Engine Co.', role: 'Chief Engineer', location: 'London, UK', tags: ['Engineering', 'Partner'], favorite: true },
  { name: 'Grace Hopper', email: 'grace@compiler.dev', phone: '+1 202 555 0142', company: 'Compiler Works', role: 'VP Engineering', location: 'Arlington, US', tags: ['Engineering'], favorite: true },
  { name: 'Alan Turing', email: 'alan@bletchley.io', phone: '+44 1908 555 210', company: 'Bletchley Labs', role: 'Research Lead', location: 'Milton Keynes, UK', tags: ['Research'], favorite: false },
  { name: 'Katherine Johnson', email: 'katherine@orbital.space', phone: '+1 757 555 0188', company: 'Orbital Dynamics', role: 'Flight Analyst', location: 'Hampton, US', tags: ['Aerospace', 'Partner'], favorite: false },
  { name: 'Hedy Lamarr', email: 'hedy@spectrum.fm', phone: '+43 1 555 0170', company: 'Spectrum Radio', role: 'Head of R&D', location: 'Vienna, AT', tags: ['Research'], favorite: true },
  { name: 'Linus Pauling', email: 'linus@bonding.chem', phone: '+1 503 555 0123', company: 'Bonding Chemistry', role: 'Principal Scientist', location: 'Portland, US', tags: ['Science'], favorite: false },
  { name: 'Marie Curie', email: 'marie@radium.inst', phone: '+33 1 55 55 01 55', company: 'Radium Institute', role: 'Director', location: 'Paris, FR', tags: ['Science', 'Partner'], favorite: true },
  { name: 'Nikola Tesla', email: 'nikola@altcurrent.co', phone: '+1 212 555 0166', company: 'Alternating Current Co.', role: 'Founder', location: 'New York, US', tags: ['Engineering', 'Vendor'], favorite: false },
  { name: 'Rosalind Franklin', email: 'rosalind@helix.bio', phone: '+44 20 7946 0177', company: 'Helix Biosciences', role: 'Crystallographer', location: 'London, UK', tags: ['Science'], favorite: false },
  { name: 'Chien-Shiung Wu', email: 'wu@parity.lab', phone: '+1 212 555 0191', company: 'Parity Lab', role: 'Physicist', location: 'New York, US', tags: ['Research'], favorite: false },
  { name: 'Tim Berners-Lee', email: 'tim@webfoundry.org', phone: '+41 22 555 0134', company: 'Web Foundry', role: 'Architect', location: 'Geneva, CH', tags: ['Engineering'], favorite: true },
  { name: 'Margaret Hamilton', email: 'margaret@apollo.sw', phone: '+1 617 555 0119', company: 'Apollo Software', role: 'Director of Software', location: 'Cambridge, US', tags: ['Engineering', 'Partner'], favorite: false },
  { name: 'Shirley Jackson', email: 'shirley@telecom.rf', phone: '+1 518 555 0147', company: 'Telecom RF', role: 'Chief Scientist', location: 'Troy, US', tags: ['Science'], favorite: false },
  { name: 'Jean Bartik', email: 'jean@eniac.dev', phone: '+1 215 555 0152', company: 'ENIAC Systems', role: 'Programmer', location: 'Philadelphia, US', tags: ['Engineering'], favorite: false },
  { name: 'Edsger Dijkstra', email: 'edsger@shortestpath.nl', phone: '+31 20 555 0163', company: 'Shortest Path BV', role: 'Consultant', location: 'Amsterdam, NL', tags: ['Consulting', 'Vendor'], favorite: false },
  { name: 'Barbara Liskov', email: 'barbara@substitution.io', phone: '+1 617 555 0128', company: 'Substitution Labs', role: 'Distinguished Engineer', location: 'Boston, US', tags: ['Engineering'], favorite: true },
  { name: 'Donald Knuth', email: 'donald@artof.dev', phone: '+1 650 555 0139', company: 'Art of Programming', role: 'Author', location: 'Palo Alto, US', tags: ['Consulting'], favorite: false },
  { name: 'Radia Perlman', email: 'radia@spanningtree.net', phone: '+1 425 555 0175', company: 'Spanning Tree Networks', role: 'Network Architect', location: 'Seattle, US', tags: ['Engineering', 'Vendor'], favorite: false },
  { name: 'Vint Cerf', email: 'vint@protocol.net', phone: '+1 703 555 0182', company: 'Protocol Group', role: 'Evangelist', location: 'Reston, US', tags: ['Partner'], favorite: false },
  { name: 'Anita Borg', email: 'anita@systers.org', phone: '+1 650 555 0193', company: 'Systers Institute', role: 'Executive Director', location: 'Palo Alto, US', tags: ['Community'], favorite: true },
  { name: 'Ken Thompson', email: 'ken@unixworks.dev', phone: '+1 908 555 0111', company: 'Unix Works', role: 'Systems Engineer', location: 'Murray Hill, US', tags: ['Engineering'], favorite: false },
  { name: 'Sophie Wilson', email: 'sophie@risc.uk', phone: '+44 1223 555 0126', company: 'RISC Designs', role: 'CPU Architect', location: 'Cambridge, UK', tags: ['Engineering', 'Vendor'], favorite: false },
  { name: 'Frances Allen', email: 'frances@optimizer.dev', phone: '+1 914 555 0158', company: 'Optimizer Inc.', role: 'Compiler Lead', location: 'Yorktown, US', tags: ['Engineering'], favorite: false },
  { name: 'Alan Kay', email: 'alan.kay@dynabook.io', phone: '+1 310 555 0164', company: 'Dynabook Studio', role: 'Principal', location: 'Los Angeles, US', tags: ['Research', 'Consulting'], favorite: false },
  { name: 'Adele Goldberg', email: 'adele@smalltalk.dev', phone: '+1 650 555 0172', company: 'Smalltalk Systems', role: 'Co-founder', location: 'Menlo Park, US', tags: ['Engineering', 'Partner'], favorite: false }
];

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private readonly items = signal<Contact[]>(
    SEED.map((contact, i) => ({
      ...contact,
      id: `contact-${i + 1}`,
      avatarSeed: contact.name.toLowerCase().replace(/\s+/g, '-'),
      lastContacted: daysAgo(i * 3 + 1)
    }))
  );

  readonly contacts = this.items.asReadonly();

  /** Every tag in use, for the filter rail. */
  readonly tags = signal(
    [...new Set(SEED.flatMap((contact) => contact.tags))].sort()
  ).asReadonly();

  toggleFavorite(id: string): void {
    this.items.update((list) =>
      list.map((contact) =>
        contact.id === id ? { ...contact, favorite: !contact.favorite } : contact
      )
    );
  }
}

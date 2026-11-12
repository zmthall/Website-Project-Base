import type { Article } from '../../shared/types/article';
import type { BusinessLocation, Address } from '../../shared/types/business';
import type { FAQItem } from '../../shared/types/faq';
import type { Service } from '../../shared/types/service';
export type StructuredDataInput =
  | { kind: 'organization' | 'website' }
  | { kind: 'location'; location: BusinessLocation }
  | { kind: 'breadcrumbs'; items: { name: string; path: string }[] }
  | { kind: 'service'; service: Service; path: string }
  | { kind: 'article'; article: Article; path: string }
  | { kind: 'faq'; items: FAQItem[]; path: string }
  | {
      kind: 'event';
      id?: string;
      path: string;
      name: string;
      description: string;
      startDate: string;
      endDate?: string;
      location: { name: string; address: Address } | { url: string };
    }
  | {
      kind: 'job';
      path: string;
      title: string;
      description: string;
      datePosted: string;
      validThrough?: string;
      employmentType?: string;
      address: Address;
    };
export type JsonLDValue =
  string | number | boolean | null | JsonLDValue[] | { [key: string]: JsonLDValue | undefined };
export type JsonLDNode = {
  '@type': string;
  '@id'?: string;
  [key: string]: JsonLDValue | undefined;
};

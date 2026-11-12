/**
 * Shared FAQ Contracts
 *
 * Defines frequently asked question content used by FAQ sections,
 * categorized FAQ interfaces, search, and structured-data generation.
 *
 * Runtime accordion state such as expanded or collapsed items does not
 * belong in these contracts.
 */

/**
 * Represents a frequently asked question and its answer.
 *
 * The same question and answer content should be usable for both visible
 * page content and FAQ structured-data generation.
 */
export interface FAQItem {
  /**
   * Stable application identifier for the FAQ.
   *
   * @example "window-installation-time"
   */
  id: string;

  /**
   * Public-facing question.
   */
  question: string;

  /**
   * Public-facing answer.
   *
   * The initial contract uses plain text. If the platform later adopts
   * a shared rich-content representation, this property may be expanded
   * to support that contract.
   */
  answer: string;

  /**
   * Optional identifier of the FAQ category to which this item belongs.
   */
  categoryId?: string;

  /**
   * Optional explicit ordering value.
   *
   * Static FAQ collections should generally rely on array order.
   */
  order?: number;
}

/**
 * Represents a logical category of frequently asked questions.
 */
export interface FAQCategory {
  /**
   * Stable application identifier for the category.
   *
   * FAQ items may reference this value through `categoryId`.
   *
   * @example "installation"
   */
  id: string;

  /**
   * Public-facing category name.
   *
   * @example "Installation"
   */
  name: string;

  /**
   * Optional supporting description for the category.
   */
  description?: string;

  /**
   * Optional explicit ordering value.
   *
   * Static FAQ-category collections should generally rely on array order.
   */
  order?: number;
}

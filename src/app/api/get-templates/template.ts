// data/templates.ts

export interface TemplateEntry {
  template: string;
  'variable-count': number;
  "message_id":string;
}

export interface TemplateMap {
  [header: string]: TemplateEntry[];
}

const templates: TemplateMap = {
  ALIAGR: [
    {
        "template":
        "Welcome to ALILAS  We're excited to have you onboard. At {#var#}, we strive to offer the best experience and support to help you get started. Whether you're here to explore, grow, or collaborate, we're here to guide you every step of the way.",
        'variable-count': 1,
        "message_id":"188673",
      
    },
  ],
};

export default templates;

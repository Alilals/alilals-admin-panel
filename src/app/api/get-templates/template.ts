// data/templates.ts

export interface TemplateEntry {
  template: string;
  "variable-count": number;
  template_id: string;
}

export interface TemplateMap {
  [header: string]: TemplateEntry[];
}

const templates: TemplateMap = {
  ALIAGR: [
    {
      template: "Welcome to ALILAS  We're excited to have you onboard. At {#var#}, we strive to offer the best experience and support to help you get started. Whether you're here to explore, grow, or collaborate, we're here to guide you every step of the way.",
      "variable-count": 1,
      template_id: "188673",
    },

    
  ],

  ZIRAAT:[
     {
      template:"Dear Grower! your OTP for login is {#var#}. Do not share it with anyone!Team ZIRAAT®",
      "variable-count": 1,
      template_id: "191100",
    },
  ]
};

export default templates;

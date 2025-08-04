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
      template:
        "Welcome to ALILAS  We're excited to have you onboard. At {#var#}, we strive to offer the best experience and support to help you get started. Whether you're here to explore, grow, or collaborate, we're here to guide you every step of the way.",
      "variable-count": 1,
      template_id: "188673",
    },
  ],

  ZIRAAT: [
    {
      template:
        "Dear Grower! your OTP for login is {#var#}. Do not share it with anyone!Team ZIRAAT®",
      "variable-count": 1,
      template_id: "191100",
    },
    {
      template:
        "We have received Rs. {#var#} for project ID {#var#}. Our representative will shortly connect with you for {#var#} .Team ZIRAAT®",
      "variable-count": 3,
      template_id: "191099",
    },
    {
      template:
        "Dear Grower {#var#}!We’re thrilled to have you with us. Project ID {#var#} has been assigned to your orchard for future reference. Your orchard development journey begins here—with expert care, precision farming, and sustainable solutions.Let’s grow success together! Team ZIRAAT® {#var#}.",
      "variable-count": 3,
      template_id: "191054",
    },
    {
      template:
        "ZIRAAT® by Alialls Agrico Pvt Ltd offers farmer-friendly High-Density Orchard installation and allied services with expert support. Click here {#var#} to Book service online for March {#var#} plantation. Or call us at 8899-888-983.",
      "variable-count": 2,
      template_id: "191053",
    },
  ],
};

export default templates;

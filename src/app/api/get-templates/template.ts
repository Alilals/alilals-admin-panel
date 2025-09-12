// data/templates.ts

export interface TemplateEntry {
  template: string;
  "variable-count": number;
  template_id: string;
  title?: string;
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
      title: "Test Template",
    },
  ],

  ZIRAAT: [ 
    {
      template:
        "Dear Grower! your OTP for login is {#var#}. Do not share it with anyone!Team ZIRAAT®",
      "variable-count": 1,
      template_id: "191100",
      title: "OTP for booking",
    },
    {
      template:
        "We have received Rs. {#price#} for project ID {#project ID#}. Our representative will shortly connect with you for {#purpose#} .Team ZIRAAT®",
      "variable-count": 3,
      template_id: "191099",
      title: "Payment Confirmation",
    },
    {
      template:
        "Dear Grower {#name#}!We’re thrilled to have you with us. Project ID {#project ID#} has been assigned to your orchard for future reference. Your orchard development journey begins here—with expert care, precision farming, and sustainable solutions.Let’s grow success together! Team ZIRAAT® {#link#}.",
      "variable-count": 3,
      template_id: "191054",
      title: "Welcome to ZIRAAT",
    },
    {
      template:
        "ZIRAAT® by Alialls Agrico Pvt Ltd offers farmer-friendly High-Density Orchard installation and allied services with expert support. Click here {#link#} to Book service online for March {#session#} plantation. Or call us at 8899-888-983.",
      "variable-count": 2,
      template_id: "191053",
      title: "Orchard Booking Marketting",
    },
    {
      template:
        "Dear Grower!Your Site {#project ID#} has been assigned a Layout team. Team lead {#lead name#}, they will visit the site on {#layout date#}.Team ZIRAAT®",
      "variable-count": 3,
      template_id: "194373",
      title: "Layout Team Deployment",
    },

    {
      template:
        "Dear Grower {#project ID#}! Your payment schedule has been updated with us as follows: First Instalment of Rs. {#first instalment amount#} due on {#first instalment date#}, Second Instalment of Rs. {#second instalment amount#} due on {#second instalment date#}, Third Instalment of Rs. {#third instalment amount#} due on {#third instalment date#}. Please make payments as scheduled to avoid any service delay. Team ZIRAAT® {#website link#}.",
      "variable-count": 8,
      template_id: "197926",
      title: "Payment Schedule",
    },
    {
      template:
        "Dear Grower {#project ID#}! Your Instalment amount of Rs. {#instalment amount#} is due on {#due date#}. Please pay on time to avoid service delays. Ignore if already paid. For assistance call our office at {#customer care number#}. Team ZIRAAT®",
      "variable-count": 4,
      template_id: "197923",
      title: "Payment Due Date Reminder",
    },
    {
      template:
        "FINAL REMINDER! Your payment of Rs. {#overdue amount#} is overdue. Please make the payment immediately to avoid any service disruption. Failure to clear the dues within 7 days will result in termination of enforceable service guarantees, including the Plant Mortality Replacement Guarantee. For assistance call our office at {#customer care number#}. Team ZIRAAT®",
      "variable-count": 2,
      template_id: "197924",
      title: "Payment Overdue Reminder",
    },
    {
      template:
        "Dear Grower {#project ID#}! We have received payment of Rs. {#payment amount#} on {#payment date#}. Your Net outstanding Balance is {#ledger balance#}. For any clarification, please call our Finance Department at {#finance department number#}. Team ZIRAAT®",
      "variable-count": 5,
      template_id: "197925",
      title: "Payment Receipt with Ledger Balance",
    },
    {
      template:
        "Dear Grower {#project ID#}! Our {#service type#} Team, headed by {#team lead#} will visit the project site on {#service date#}. Please remain available on the mentioned date. Team ZIRAAT®",
      "variable-count": 4,
      template_id: "197922",
      title: "Service Team Deployment",
    },
  ],
};

export default templates;

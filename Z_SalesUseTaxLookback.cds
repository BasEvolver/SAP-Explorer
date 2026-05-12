@AbapCatalog.sqlViewName: 'ZVSUTLOOKBACK'
@AbapCatalog.compiler.compareFilter: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Sales and Use Tax Lookback Data'
@OData.publish: true

define view Z_SalesUseTaxLookback 
  as select from vbrk as BillHeader
  
  // 1. Join Billing Item details
  join vbrp as BillItem 
    on BillHeader.vbeln = BillItem.vbeln
    
  // 2. Join Pricing Elements (Taxes)
  left outer join prcd_elements as Pricing 
    on BillHeader.knumv = Pricing.knumv
   and BillItem.posnr = Pricing.kposn
   
  // 3. Join Customer Master (Sold-To)
  left outer join kna1 as Customer
    on BillHeader.kunag = Customer.kunnr
    
  // 4. Join Material Text (filtered by system language)
  left outer join makt as MaterialText
    on BillItem.matnr = MaterialText.matnr
   and MaterialText.spras = $session.system_language
   
  // 5. Join Plant Text
  left outer join t001w as PlantText
    on BillItem.werks = PlantText.werks
    
  // 6. Join Company Code Text
  left outer join t001 as CompanyText
    on BillHeader.bukrs = CompanyText.bukrs
    
  // 7. Join Condition Type Text (Pricing conditions)
  left outer join t685t as ConditionText
    on Pricing.kschl = ConditionText.kschl
   and ConditionText.spras = $session.system_language
   and ConditionText.kvewe = 'A' // Application 'A' = Pricing

{
    // --- Document Identifiers ---
    key BillItem.vbeln as BillingDocument,
    key BillItem.posnr as BillingDocumentItem,
    
    // --- Date Data ---
    // The annotation forces OData to format the 8-char string as a Date object
    @Semantics.businessDate.at: true
    BillHeader.fkdat as BillingDocumentDate,
    
    // --- Company Data ---
    BillHeader.bukrs as CompanyCode,
    CompanyText.butxt as CompanyName,
    
    // --- Customer Data ---
    BillHeader.kunag as SoldToParty,
    Customer.name1 as CustomerName,
    
    // --- Plant & Geographic Data ---
    BillItem.werks as Plant,
    PlantText.name1 as PlantName,
    BillItem.txjcd as TaxJurisdiction,
    
    // --- Material Data ---
    BillItem.matnr as Material,
    MaterialText.maktx as MaterialDescription,
    BillItem.matkl as MaterialGroup,
    
    // --- Tax Condition Data ---
    Pricing.kschl as ConditionType,
    ConditionText.vtext as ConditionTypeName,
    
    // --- Financial Amounts ---
    Pricing.kbetr as ConditionRateValue,
    
    @Semantics.currencyCode: true
    Pricing.waers as TransactionCurrency,
    
    @Semantics.amount.currencyCode: 'TransactionCurrency'
    Pricing.kwert as ConditionAmount
}
// Filter to only pull US Tax Condition prefixes
where Pricing.kschl like 'J%' or Pricing.kschl like 'U%'

@AbapCatalog.sqlViewName: 'ZVWHTREGISTER'
@AbapCatalog.compiler.compareFilter: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Withholding Tax Register'
@OData.publish: true

define view Z_WithholdingTax 
  as select from with_item as WHT
  
  // 1. Join Header for Dates and Currency
  join bkpf as Header
    on WHT.bukrs = Header.bukrs
   and WHT.belnr = Header.belnr
   and WHT.gjahr = Header.gjahr
   
  // 2. Join Line Item for Vendor Number
  join bseg as Item
    on WHT.bukrs = Item.bukrs
   and WHT.belnr = Item.belnr
   and WHT.gjahr = Item.gjahr
   and WHT.buzei = Item.buzei
   
  // 3. Join Vendor Master
  left outer join lfa1 as Vendor
    on Item.lifnr = Vendor.lifnr
    
  // 4. Join Company Code for Country and Text
  left outer join t001 as CompanyText
    on WHT.bukrs = CompanyText.bukrs
    
  // 5. Join Withholding Tax Type Texts
  left outer join t059zt as WHTTypeText
    on CompanyText.land1 = WHTTypeText.land1
   and WHT.witht = WHTTypeText.witht
   and WHTTypeText.spras = $session.system_language

{
    // --- Document Identifiers ---
    key WHT.bukrs as CompanyCode,
    key WHT.belnr as AccountingDocument,
    key WHT.gjahr as FiscalYear,
    key WHT.buzei as DocumentItem,
    key WHT.witht as WithholdingTaxType,
    key WHT.wt_withcd as WithholdingTaxCode,
    
    // --- Company Data ---
    CompanyText.butxt as CompanyName,
    
    // --- Vendor Data ---
    Item.lifnr as VendorNumber,
    Vendor.name1 as VendorName,
    Vendor.stcd1 as VendorTaxID1,
    Vendor.stcd2 as VendorTaxID2,
    
    // --- Date Data ---
    @Semantics.businessDate.at: true
    Header.budat as PostingDate,
    
    // --- Tax Details ---
    WHTTypeText.text40 as WithholdingTaxTypeName,
    WHT.qsatz as WithholdingTaxRate,
    
    // --- Financial Amounts ---
    @Semantics.currencyCode: true
    Header.waers as TransactionCurrency,
    
    @Semantics.amount.currencyCode: 'TransactionCurrency'
    WHT.wt_qsshh as WithholdingBaseAmount,
    
    @Semantics.amount.currencyCode: 'TransactionCurrency'
    WHT.wt_qbshh as WithheldTaxAmount
}

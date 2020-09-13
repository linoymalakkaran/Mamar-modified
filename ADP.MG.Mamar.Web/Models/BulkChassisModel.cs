using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace ADP.MG.Mamar.Web.Models
{
	public class BulkChassisModel
	{

        public bool IsError { get; set; }
        public Int64? JobNumber { get; set; }
		public string CompanyCode { get; set; }
		public string UserCode { get; set; }
		public string CenterCode { get; set; }
        public DataTable Information { get; set; }
        public string TotalCount { get; set; }
        public string FileLink { get; set; }
        public string Response { get; set; }
       // public string ResposneInvoice { get; set; }
        public List<ChassisDTO> Chassises { get; set; }
		public List<InvoiceDTO> Invoices { get; set; }
	}
	public class InvoiceDTO
	{
		//public long InoviceNumber { get; set; }
		//public string HSCode { get; set; }
		//public string Description { get; set; }
		//public string CountryOfOrigin { get; set; }
		//public long Quantity { get; set; }
		//public float NetWeight { get; set; }
		//public float GrossWeight { get; set; }
		//public string Currency { get; set; }
		//public string INCOTERM { get; set; }
		//public float InvoiceAmount { get; set; }
		//public float FreightAmount { get; set; }
		//public string FreightCurrency { get; set; }
		//public float InsuranceAmount { get; set; }
		public int? RNum { get; set; }
		public string InoviceNumber { get; set; }
        public string HSCode { get; set; }
        public string Description { get; set; }
        public string CountryOfOrigin { get; set; }
        public long? Quantity { get; set; }
        public decimal? NetWeight { get; set; }
        public decimal? GrossWeight { get; set; }
        public string Currency { get; set; }
        public string INCOTERM { get; set; }
        public decimal? InvoiceAmount { get; set; }
        public decimal? FreightAmount { get; set; }
        public string FreightCurrency { get; set; }
        public decimal? InsuranceAmount { get; set; }
		public string InvoiceRefNumber { get; set; }
	}
	public class ChassisDTO
	{
        public int? RNum { get; set; }
        public string ChassisNumber { get; set; }
        public string EngineNumber { get; set; }
        public string CountryCode { get; set; }
        public string CountryEngName { get; set; }
        public string CountryArbName { get; set; }
        public int? ModelYear { get; set; }
        public string ColorCode { get; set; }
        public string ColorEngName { get; set; }
        public string ColorArbName { get; set; }
        public string PoliceColorCode { get; set; }
        public string PoliceColorEngName { get; set; }
        public string PoliceColorArbName { get; set; }
        public string ChassisIssueFlag { get; set; }
        public string ReExportFlag { get; set; }
        public string VehicleSpecification { get; set; }
        public string BodyTypeCode { get; set; }
        public string BodyTypeEng { get; set; }
        public string BodyTypeArb { get; set; } // bodyType
        public string SubTypeCode { get; set; }
        public string SubEngName { get; set; }
        public string SubArbName { get; set; }
        public string CatgoryEng { get; set; }//sub type cateory
        public string CategoryArb { get; set; }
        public long? TrafficNumber { get; set; }
        public string UAEID { get; set; }
        public int? Cylinders { get; set; }
        public int? PayLoad { get; set; }
        public long? Weight { get; set; }
        public int? NumberOfChairs { get; set; }
        public string PatrolType { get; set; }
        public string NumberOfDoors { get; set; }
        public int? NumberOfWheels { get; set; }
        public string TransmissionType { get; set; }
        public int? NumberOfAxils { get; set; }
        public string EnginePower { get; set; }
        public string SteeringType { get; set; }
        public string VehicleRemarks { get; set; }  //Vehicle Remarks
        public string AgentRemarks { get; set; }
        public string CurrencyCode { get; set; }
        public decimal? PriceCIF { get; set; }
        public string CurrenyEng { get; set; }
        public string CurrencyArb { get; set; }
        public decimal? ExchangeRate { get; set; }

    }
}
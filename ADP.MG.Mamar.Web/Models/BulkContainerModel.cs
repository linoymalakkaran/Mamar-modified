using Microsoft.Office.Interop.Excel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ADP.MG.Mamar.Web.Models
{
	public class BulkContainerModel
	{
		public bool IsError { get; set; }
		public string CompanyCode { get; set; }
		public string UserCode { get; set; }
		public string CenterCode { get; set; }
		public Int64? JobNumber { get; set; }
		public DataTable Information { get; set; }
		public string TotalCount { get; set; }
		public string FileLink { get; set; }
		public string Response { get; set; }
		public List<ContainerDTO> Containers { get; set; }
	}

	public class ContainerDTO 
	{

		public string ContainerNumber { get; set; }

		public string SealNumber { get; set; }

		public int? Size { get; set; }

		public string Service { get; set; }

		public decimal? Weight { get; set; }

		public decimal? Measure { get; set; }

		public string Remarks { get; set; }

		public string Channel { get; set; }

		public int? RowNumber { get; set; }
	}



}
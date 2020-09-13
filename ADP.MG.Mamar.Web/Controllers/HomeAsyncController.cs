using ADP.MG.Mamar.Web.ApiInfrastructure;
using ApiHelper;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using ADP.MG.Mamar.Web.ApiInfrastructure.Client;
using System.Web.Compilation;
using Newtonsoft.Json;
using System.Web.Script.Serialization;
using Telerik.Reporting;
using System.Configuration;
using ADP.MG.Mamar.Web.ReportHelper;
using ADP.MG.Mamar.Web.ReportHelper.DTO;
using System.Web.Http;
using System.IO;
using System.Net;
using System.Data.OleDb;
using Hangfire;
using System.Data;
using ADP.MG.Mamar.Web.Models;
using Microsoft.Office.Interop.Excel;
using Microsoft.AspNet.SignalR;
using ADP.MG.Mamar.Web.Content;
using System.Text.RegularExpressions;
using Excel = Microsoft.Office.Interop.Excel;
using Microsoft.AspNet.Identity;

namespace ADP.MG.Mamar.Web.Controllers
{
	[SessionState(System.Web.SessionState.SessionStateBehavior.Disabled)]
	public class HomeAsyncController : Controller
	{
		//private readonly IHostingEnvironment hh;
		public ActionResult Index()
		{
			ViewBag.UserName = User.Identity.Name;
			return View();
		}
		public ActionResult ConsolidatedIndex()
		{
			ViewBag.UserName = User.Identity.Name;
			return View();
		}

		public ActionResult GMSDashboard()
		{
			ViewBag.UserName = User.Identity.Name;
			return View();
		}



		[OutputCache(NoStore = true, Duration = 0, VaryByParam = "None")]
		[HttpPost]
		public async Task<JsonResult> PostFile(HttpPostedFileBase file, string UCode, string CCode, string ApiUrl, dynamic aData, string aProperty)
		{

			string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;
			if (aProperty.Contains("Chassis") != true && aProperty.Contains("Invoice") != true && aProperty.Contains("Container") != true)
			{
				byte[] data;
				using (Stream inputStream = file.InputStream)
				{
					MemoryStream memoryStream = inputStream as MemoryStream;
					if (memoryStream == null)
					{
						memoryStream = new MemoryStream();
						inputStream.CopyTo(memoryStream);
					}
					data = memoryStream.ToArray();
				}

				var customHeadersList = new Dictionary<string, string>();
				var cCodeVal = !string.IsNullOrEmpty(CCode) ? CCode.ToString() : string.Empty;
				var uCodeVal = !string.IsNullOrEmpty(UCode) ? UCode.ToString() : string.Empty;
				customHeadersList.Add("CCode", cCodeVal);
				customHeadersList.Add("UCode", uCodeVal);



				var targetTypeValue = string.Format("{0}.{1}", "ADP.MG.Pcs.Models", "");

				var targetType = BuildManager.GetType(targetTypeValue, false);

				var data1 = JsonConvert.DeserializeObject(((dynamic[])aData)[0], targetType);
				data1[aProperty] = data;
				if (token == null)
				{
					return Json(new
					{
						redirectUrl = Url.Action("LogOff", "Account"),
						isRedirect = true
					}, JsonRequestBehavior.AllowGet);
				}
				ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, token);
				GenericClient cb = new GenericClient(client);

				var response = await cb.Post(ApiUrl, data1, customHeadersList);

				return Json(response, JsonRequestBehavior.AllowGet);
			}
			else if (aProperty.Contains("Container") == true)
			{
				try
				{
					Models.ApiModel apiModel = new ApiModel();

					var customHeadersList = new Dictionary<string, string>();
					var cCodeVal = !string.IsNullOrEmpty(CCode) ? CCode.ToString() : string.Empty;
					var uCodeVal = !string.IsNullOrEmpty(UCode) ? UCode.ToString() : string.Empty;
					customHeadersList.Add("CCode", cCodeVal);
					customHeadersList.Add("UCode", uCodeVal);



					if (token == null)
					{
						return Json(new
						{
							redirectUrl = Url.Action("LogOff", "Account"),
							isRedirect = true
						}, JsonRequestBehavior.AllowGet);
					}

					//var targetTypeValue = string.Format("{0}.{1}", "ADP.MG.Pcs.Models", "");
					//var targetType = BuildManager.GetType(targetTypeValue, false);

					var data1 = JsonConvert.DeserializeObject<ParameterForChassis>(((dynamic[])aData)[0]);



					BulkContainerModel CalculatingExcelData = await UploadExcelFileContainer(file, Convert.ToInt64(data1.jobNumber), CCode, UCode, data1.CenterCode, ApiUrl, aProperty);

					if (CalculatingExcelData.IsError)
					{
						return Json(CalculatingExcelData, JsonRequestBehavior.AllowGet);
					}
					apiModel.ApiUrl = ApiUrl;
					apiModel.Data = JsonConvert.SerializeObject(CalculatingExcelData, Formatting.None);


					var Inforamtion = GetTargetData(apiModel);
					ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, token);
					GenericClient cb = new GenericClient(client);

					var response = await cb.Post(apiModel.ApiUrl, Inforamtion, customHeadersList);//data
					if (response != null)
					{
						RootObject info = JsonConvert.DeserializeObject<RootObject>(JsonConvert.SerializeObject(response));
						RootUser user = JsonConvert.DeserializeObject<RootUser>(info.ResponseResult);
						ApiHelper.Response.ApiResponse ValidayteResponse = new ApiHelper.Response.ApiResponse();
						//if (user.isValid == "true")
						//{
						//	string[] properties = new string[4];

						//	properties[0] = (string.Format("{0}={1}", "centerCode", CalculatingExcelData.CenterCode));
						//	properties[1] = (string.Format("{0}={1}", "jobNumber", CalculatingExcelData.JobNumber));
						//	properties[2] = (string.Format("{0}={1}", "maqasa", "N"));
						//	properties[3] = (string.Format("{0}={1}", "operationMode", "UPDATE"));

						//	string queryString = string.Join("&", properties);
						//	ValidayteResponse = await cb.Get("Customs/Invoice/Validate" + "?" + queryString, customHeadersList);
						//}
						List<string> allConnectedUser = new List<string>();
						allConnectedUser.AddRange(user.users);
						MamarHub hub = new MamarHub();
						hub.ChassisResponse(info.DynamicResult.Messages, allConnectedUser, user.isValid, CalculatingExcelData.JobNumber.ToString(), User.Identity.Name, ValidayteResponse);
					}

					return Json(response, JsonRequestBehavior.AllowGet);
				}
				catch (Exception ex)
				{
					CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
					return Json(ex, JsonRequestBehavior.AllowGet);
				}
			}
			else
			{
				try
				{
					Models.ApiModel apiModel = new ApiModel();

					var customHeadersList = new Dictionary<string, string>();
					var cCodeVal = !string.IsNullOrEmpty(CCode) ? CCode.ToString() : string.Empty;
					var uCodeVal = !string.IsNullOrEmpty(UCode) ? UCode.ToString() : string.Empty;
					customHeadersList.Add("CCode", cCodeVal);
					customHeadersList.Add("UCode", uCodeVal);



					if (token == null)
					{
						return Json(new
						{
							redirectUrl = Url.Action("LogOff", "Account"),
							isRedirect = true
						}, JsonRequestBehavior.AllowGet);
					}

					//var targetTypeValue = string.Format("{0}.{1}", "ADP.MG.Pcs.Models", "");
					//var targetType = BuildManager.GetType(targetTypeValue, false);

					var data1 = JsonConvert.DeserializeObject<ParameterForChassis>(((dynamic[])aData)[0]);



					BulkChassisModel CalculatingExcelData = await UploadExcelFileChassis(file, Convert.ToInt64(data1.jobNumber), CCode, UCode, data1.CenterCode, ApiUrl, aProperty);

					if (CalculatingExcelData.IsError)
					{
						return Json(CalculatingExcelData, JsonRequestBehavior.AllowGet);
					}
					apiModel.ApiUrl = ApiUrl;
					apiModel.Data = JsonConvert.SerializeObject(CalculatingExcelData, Formatting.None);


					var Inforamtion = GetTargetData(apiModel);
					ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, token);
					GenericClient cb = new GenericClient(client);

					var response = await cb.Post(apiModel.ApiUrl, Inforamtion, customHeadersList);//data
					if (response != null)
					{
						RootObject info = JsonConvert.DeserializeObject<RootObject>(JsonConvert.SerializeObject(response));
						RootUser user = JsonConvert.DeserializeObject<RootUser>(info.ResponseResult);
						ApiHelper.Response.ApiResponse ValidayteResponse = new ApiHelper.Response.ApiResponse();
						if (user.isValid == "true")
						{
							string[] properties = new string[4];

							properties[0] = (string.Format("{0}={1}", "centerCode", CalculatingExcelData.CenterCode));
							properties[1] = (string.Format("{0}={1}", "jobNumber", CalculatingExcelData.JobNumber));
							properties[2] = (string.Format("{0}={1}", "maqasa", "N"));
							properties[3] = (string.Format("{0}={1}", "operationMode", "UPDATE"));

							string queryString = string.Join("&", properties);
							ValidayteResponse = await cb.Get("Customs/Invoice/Validate" + "?" + queryString, customHeadersList);
						}
						List<string> allConnectedUser = new List<string>();
						allConnectedUser.AddRange(user.users);
						MamarHub hub = new MamarHub();
						hub.ChassisResponse(info.DynamicResult.Messages, allConnectedUser, user.isValid, CalculatingExcelData.JobNumber.ToString(), User.Identity.Name, ValidayteResponse);
					}
					//else
					//{
					//	return Json(CalculatingExcelData, JsonRequestBehavior.AllowGet);
					//}

					return Json(response, JsonRequestBehavior.AllowGet);
				}
				catch (Exception ex)
				{
					CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
					return Json(ex, JsonRequestBehavior.AllowGet);
				}
			}
		}

		public static Models.ApiModel ValidateForChassisInvoiceTransaction(long? JobNumber, string CenterCode)
		{
			Models.ApiModel apiModelValidate = new ApiModel();
			ParameterForValidateChassisInvoice ValidateParameters = new ParameterForValidateChassisInvoice();
			ValidateParameters.jobNumber = Convert.ToString(JobNumber);
			ValidateParameters.centerCode = CenterCode;
			ValidateParameters.maqasa = "N";
			ValidateParameters.operationMode = "UPDATE";
			apiModelValidate.Data = JsonConvert.SerializeObject(ValidateParameters);
			apiModelValidate.ApiUrl = "Customs/Invoice/Validate";
			var ValidateData = GetTargetData(apiModelValidate);
			return apiModelValidate;
		}

		private static dynamic GetTargetData(Models.ApiModel apiModel)
		{
			if (apiModel.Data != null)
			{
				var targetTypeValue = string.Format("{0}.{1}", "ADP.MG.Pcs.Models", apiModel.TargetType);

				var targetType = BuildManager.GetType(targetTypeValue, false);

				var data = JsonConvert.DeserializeObject(apiModel.Data, targetType);
				return data;
			}
			else
				return null;
		}

		public async Task<ActionResult> DownloadReport(string targetUrl, string CCode, string UCode, string ReportParameter)
		{

			string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;

			if (token == null)
			{
				return Json(new
				{
					redirectUrl = Url.Action("LogOff", "Account"),
					isRedirect = true
				}, JsonRequestBehavior.AllowGet);
			}
			ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, token);
			GenericClient cb = new GenericClient(client);
			var response = await cb.Get(targetUrl);
			JavaScriptSerializer j = new JavaScriptSerializer();
			ADP.MG.Pcs.Models.EntityModels.Report reportModel = default(ADP.MG.Pcs.Models.EntityModels.Report);
			if (!string.IsNullOrEmpty((response.ResponseResult)))
				reportModel = Newtonsoft.Json.JsonConvert.DeserializeObject<ADP.MG.Pcs.Models.EntityModels.Report>(response.ResponseResult);
			//var typeReportSource = new UriReportSource { Uri = string.Format("Reports/{0}", reportModel.ReportFileName) };
			var typeReportSource = new UriReportSource { Uri = string.Format("Report/{0}", "CustomReport.trdx") };
			string[] parameters;
			parameters = ReportParameter.ToString().Split(';');
			typeReportSource.Parameters.Add("centerCode", parameters[0]);
			typeReportSource.Parameters.Add("jobNumber", parameters[1]);
			typeReportSource.Parameters.Add("searchString", parameters[2]);
			typeReportSource.Parameters.Add("pageNumber", parameters[3]);
			typeReportSource.Parameters.Add("pageSize", parameters[4]);
			typeReportSource.Parameters.Add("CCode", CCode);
			typeReportSource.Parameters.Add("UCode", UCode);



			Telerik.Reporting.Processing.ReportProcessor reportProcessor = new Telerik.Reporting.Processing.ReportProcessor();
			//Telerik.Reporting.Processing.RenderingResult result = reportProcessor.RenderReport(reportModel.DownloadType.ToUpper(), typeReportSource, null);
			Telerik.Reporting.Processing.RenderingResult result = reportProcessor.RenderReport("XLS", typeReportSource, null);
			byte[] contents = result.DocumentBytes;
			//string mimeType = reportModel.DownloadType == "xls" ? "vnd.ms-excel" : "vnd.ms-excel";//reportModel.DownloadType;
			string mimeType = "vnd.ms-excel";//reportModel.DownloadType;
											 //return File(contents, string.Format("application/{0}", mimeType), reportModel.DownloadFileName);
			return File(contents, string.Format("application/{0}", mimeType), "Chassis Details.xls");
		}

		public async Task<ActionResult> DownloadExemptionReport(string targetUrl, string CCode, string UCode, string ReportParameter)
		{

			string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;
			if (token == null)
			{
				return Json(new
				{
					redirectUrl = Url.Action("LogOff", "Account"),
					isRedirect = true
				}, JsonRequestBehavior.AllowGet);
			}
			ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, token);
			GenericClient cb = new GenericClient(client);
			var response = await cb.Get(targetUrl);
			JavaScriptSerializer j = new JavaScriptSerializer();
			ADP.MG.Pcs.Models.EntityModels.Report reportModel = default(ADP.MG.Pcs.Models.EntityModels.Report);
			if (!string.IsNullOrEmpty((response.ResponseResult)))
				reportModel = Newtonsoft.Json.JsonConvert.DeserializeObject<ADP.MG.Pcs.Models.EntityModels.Report>(response.ResponseResult);
			var typeReportSource = new UriReportSource { Uri = string.Format("Report/{0}", "Examptions.trdx") };
			string[] parameters;
			parameters = ReportParameter.ToString().Split(';');
			typeReportSource.Parameters.Add("jobNumber", parameters[0]);
			typeReportSource.Parameters.Add("eLACode", parameters[1]);
			typeReportSource.Parameters.Add("centerCode", parameters[2]);
			typeReportSource.Parameters.Add("CCode", CCode);
			typeReportSource.Parameters.Add("UCode", UCode);
			Telerik.Reporting.Processing.ReportProcessor reportProcessor = new Telerik.Reporting.Processing.ReportProcessor();
			Telerik.Reporting.Processing.RenderingResult result = reportProcessor.RenderReport("PDF", typeReportSource, null);
			byte[] contents = result.DocumentBytes;
			string mimeType = "PDF";
			return File(contents, string.Format("application/{0}", mimeType), "Exemptions.pdf");
		}

		#region GMSDashboard Report Download
		[HttpGet]
		public async Task<ActionResult> DownloadPDFGMSStatusReport(string obj)
		{
			var arg = JsonConvert.DeserializeObject<CustomClearanceBIZSearchDTO>(obj);
			string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;
			//	ITokenContainer tokenContainer = new TokenContainer();

			if (token == null)
			{
				return Json(new
				{
					redirectUrl = Url.Action("LogOff", "Account"),
					isRedirect = true
				}, JsonRequestBehavior.AllowGet);
			}
			const string FILE_TYPE = "PDF";
			var helper = new GMSDashboardHelper();
			var path = Server.MapPath(@"~/");
			var contents = await helper.GetReport(FILE_TYPE, path, arg);
			//return  Json( new { data= contents});
			string mimeType = "pdf";
			return File(contents, string.Format("application/{0}", mimeType), "StatusReport.pdf");
		}

		[HttpGet]
		public async Task<ActionResult> DownloadExcelGMSStatusReport(string obj)
		{
			var arg = JsonConvert.DeserializeObject<CustomClearanceBIZSearchDTO>(obj);
			string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;
			if (token == null)
			{
				return Json(new
				{
					redirectUrl = Url.Action("LogOff", "Account"),
					isRedirect = true
				}, JsonRequestBehavior.AllowGet);
			}
			const string FILE_TYPE = "XLS";
			var helper = new GMSDashboardHelper();
			var path = Server.MapPath(@"~/");
			var contents = await helper.GetReport(FILE_TYPE, path, arg);
			string mimeType = "vnd.ms-excel";
			return File(contents, string.Format("application/{0}", mimeType), "StatusReport.xls");
		}
		#endregion

		public async Task<ActionResult> DownloadInspectionReport(string targetUrl, string CCode, string UCode, string ReportParameter)
		{

			string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;
			if (token == null)
			{
				return Json(new
				{
					redirectUrl = Url.Action("LogOff", "Account"),
					isRedirect = true
				}, JsonRequestBehavior.AllowGet);
			}
			ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, token);
			GenericClient cb = new GenericClient(client);
			var response = await cb.Get(targetUrl);
			JavaScriptSerializer j = new JavaScriptSerializer();
			ADP.MG.Pcs.Models.EntityModels.Report reportModel = default(ADP.MG.Pcs.Models.EntityModels.Report);
			if (!string.IsNullOrEmpty((response.ResponseResult)))
				reportModel = Newtonsoft.Json.JsonConvert.DeserializeObject<ADP.MG.Pcs.Models.EntityModels.Report>(response.ResponseResult);
			var typeReportSource = new UriReportSource { Uri = string.Format("Report/{0}", "Inspections.trdx") };
			string[] parameters;
			parameters = ReportParameter.ToString().Split(';');
			typeReportSource.Parameters.Add("jobNumber", parameters[0]);
			typeReportSource.Parameters.Add("eLACode", parameters[1]);
			typeReportSource.Parameters.Add("CCode", CCode);
			typeReportSource.Parameters.Add("UCode", UCode);
			Telerik.Reporting.Processing.ReportProcessor reportProcessor = new Telerik.Reporting.Processing.ReportProcessor();
			Telerik.Reporting.Processing.RenderingResult result = reportProcessor.RenderReport("PDF", typeReportSource, null);
			byte[] contents = result.DocumentBytes;
			string mimeType = "PDF";
			return File(contents, string.Format("application/{0}", mimeType), "Inspections.pdf");
		}

		public async Task<ActionResult> DownloadApprovalReport(string targetUrl, string CCode, string UCode, string ReportParameter)
		{

			string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;
			if (token == null)
			{
				return Json(new
				{
					redirectUrl = Url.Action("LogOff", "Account"),
					isRedirect = true
				}, JsonRequestBehavior.AllowGet);
			}
			ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, token);
			GenericClient cb = new GenericClient(client);
			var response = await cb.Get(targetUrl);
			JavaScriptSerializer j = new JavaScriptSerializer();
			ADP.MG.Pcs.Models.EntityModels.Report reportModel = default(ADP.MG.Pcs.Models.EntityModels.Report);
			if (!string.IsNullOrEmpty((response.ResponseResult)))
				reportModel = Newtonsoft.Json.JsonConvert.DeserializeObject<ADP.MG.Pcs.Models.EntityModels.Report>(response.ResponseResult);

			var typeReportSource = new UriReportSource { Uri = string.Format("Report/{0}", "Approval.trdx") };
			string[] parameters;
			parameters = ReportParameter.ToString().Split(';');
			typeReportSource.Parameters.Add("centerCode", parameters[0]);
			typeReportSource.Parameters.Add("jobNumber", parameters[1]);
			typeReportSource.Parameters.Add("CCode", CCode);
			typeReportSource.Parameters.Add("UCode", UCode);
			Telerik.Reporting.Processing.ReportProcessor reportProcessor = new Telerik.Reporting.Processing.ReportProcessor();
			Telerik.Reporting.Processing.RenderingResult result = reportProcessor.RenderReport("PDF", typeReportSource, null);
			byte[] contents = result.DocumentBytes;
			string mimeType = "PDF";
			return File(contents, string.Format("application/{0}", mimeType), "Approval.pdf");
		}

		public async Task<ActionResult> DownloadInspectionReports(string targetUrl, string CCode, string UCode, string ReportParameter)
		{

			string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;
			if (token == null)
			{
				return Json(new
				{
					redirectUrl = Url.Action("LogOff", "Account"),
					isRedirect = true
				}, JsonRequestBehavior.AllowGet);
			}
			ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, token);
			GenericClient cb = new GenericClient(client);
			var response = await cb.Get(targetUrl);
			JavaScriptSerializer j = new JavaScriptSerializer();
			ADP.MG.Pcs.Models.EntityModels.Report reportModel = default(ADP.MG.Pcs.Models.EntityModels.Report);
			if (!string.IsNullOrEmpty((response.ResponseResult)))
				reportModel = Newtonsoft.Json.JsonConvert.DeserializeObject<ADP.MG.Pcs.Models.EntityModels.Report>(response.ResponseResult);
			var typeReportSource = new UriReportSource { Uri = string.Format("Report/{0}", "Inspection.trdx") };
			string[] parameters;
			parameters = ReportParameter.ToString().Split(';');
			typeReportSource.Parameters.Add("jobNumber", parameters[0]);
			typeReportSource.Parameters.Add("inspectionRefNum", parameters[1]);
			typeReportSource.Parameters.Add("CCode", CCode);
			typeReportSource.Parameters.Add("UCode", UCode);
			Telerik.Reporting.Processing.ReportProcessor reportProcessor = new Telerik.Reporting.Processing.ReportProcessor();
			Telerik.Reporting.Processing.RenderingResult result = reportProcessor.RenderReport("PDF", typeReportSource, null);
			byte[] contents = result.DocumentBytes;
			string mimeType = "PDF";
			return File(contents, string.Format("application/{0}", mimeType), "Inspection.pdf");
		}
		public ActionResult DownLoadEIDSetup()
		{
			return File(Server.MapPath("~/ClientSetup/EIDReaderSetup.zip"),
						"application/zip", "EIDReaderSetup.zip");
		}
		[HttpGet]
		public JsonResult RedirectToOtherService(string service, dynamic data)
		{
			try
			{
				string url = string.Empty;
				switch (service)
				{
					case "transport":
						url = ConfigurationManager.AppSettings["TransportOrderUrl"];
						break;
					case "appointment":
						url = ConfigurationManager.AppSettings["AppointmentUrl"];
						break;
					case "kizad":
						url = ConfigurationManager.AppSettings["KizadUrl"];
						break;
					default:
						break;
				}
				return Json(url, JsonRequestBehavior.AllowGet);
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				throw ex;
			}
		}
		//public class MachineName
		//{
		//    public string userHostAddress { get; set; }
		//    public string hostAddress { get; set; }
		//    public string machineName { get; set; }
		//}
		[HttpPost]
		public ActionResult UploadChassis(HttpPostedFileBase attachment, long jobNumber, string companyCode, string userCode, string centerCode, string apiUrl, byte[] bytes)
		{
			//AjaxResponseViewModel response = new AjaxResponseViewModel();
			if (attachment != null)
			{
				try
				{
					//response = UploadExcelFile(attachment,jobNumber,companyCode,userCode,centerCode,apiUrl, bytes);
				}
				catch (Exception ex)
				{
					CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
					//response.Success = false;
					//response.Message = "Error while uploading file to server";
				}
			}
			return Json("", JsonRequestBehavior.AllowGet);
		}

		private async Task<BulkContainerModel> UploadExcelFileContainer(HttpPostedFileBase attachment, long jobNumber, string companyCode, string userCode, string centerCode, string apiUrl, string aProperty)
		{
			BulkContainerModel bulkData = new BulkContainerModel();
			List<string> sheetname = new List<string>();
			System.Data.DataTable containerDT = new System.Data.DataTable();

			string extension = Path.GetExtension(attachment.FileName).ToLower();
			//////////////////////////////////////////////////////////////////////

			byte[] data;
			using (Stream inputStream = attachment.InputStream)
			{
				MemoryStream memoryStream = inputStream as MemoryStream;
				if (memoryStream == null)
				{
					memoryStream = new MemoryStream();
					await inputStream.CopyToAsync(memoryStream);
				}
				data = memoryStream.ToArray();
				memoryStream.Close();
				inputStream.Dispose();
			}
			string fileLocation = string.Empty;
			try
			{
				extension = !string.IsNullOrEmpty(extension) ? extension.ToLower() : string.Empty;
				string fileName = string.Format("{0}{1}", Guid.NewGuid().ToString(), extension);
				string dirPath = Server.MapPath("~/Content/UploadChassisInvoice/" + fileName);

				//if (aProperty.Contains("Invoice"))
				//{
				//	dirPath = Server.MapPath("~/Content/UploadChassisInvoice/" + fileName);
				//}
				//else if (aProperty.Contains("Chassis"))
				//{
				//	dirPath = Server.MapPath("~/Content/UploadChassisInvoice/" + fileName);
				//}

				fileLocation = dirPath;

				await Task.Run(() => System.IO.File.WriteAllBytes(fileLocation, data));


				//System.Data.DataTable INDT = ReadExcel(fileLocation, 1);
				//System.Data.DataTable CHDT = ReadExcel(fileLocation, 2);

				///
				DataSet ds = new DataSet();
				DataSet dsInvoice = new DataSet();
				var excelConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + fileLocation + ";Extended Properties=\"Excel 12.0;HDR=YES;IMEX=2\"";// string.Format("Provider=Microsoft.Jet.OLEDB.4.0;Data Source={0};Extended Properties=Excel 8.0", fileLocation);
				OleDbConnection connection = new OleDbConnection();
				connection.ConnectionString = excelConnectionString;

				System.Data.DataTable sheets = await GetSchemaTable(excelConnectionString);
				sheetname.Add("CONTAINERS$");
				//if (aProperty.Contains("Invoice"))
				//{
				//	sheetname.Add("Invoices$");
				//}
				//else
				//{
				//	sheetname.Add("Chassis List$");
				//	sheetname.Add("Invoices$");
				//}

				foreach (var r in sheetname)
				{
					string query = "SELECT * FROM [" + r + "]";
					// ds.Clear();
					OleDbDataAdapter daata = new OleDbDataAdapter(query, connection);

					if (r == "CONTAINERS$")
					{
						daata.Fill(ds);
						containerDT = ds.Tables[0];
					}
					//else if (r == "Invoices$")
					//{
					//	daata.Fill(dsInvoice);
					//	InvoiceDT = dsInvoice.Tables[0];
					//}
				}
				connection.Close();

			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				throw ex;
			}

			try
			{
				//		ReadExcel(fileLocation);
				bulkData = await UploadContainer(fileLocation, jobNumber, companyCode, userCode, centerCode, apiUrl, containerDT);
				return bulkData;
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				throw ex;
			}
			//return response;
			////////////////////////////////////////////////////////////////////////
		}

		private async Task<BulkChassisModel> UploadExcelFileChassis(HttpPostedFileBase attachment, long jobNumber, string companyCode, string userCode, string centerCode, string apiUrl, string aProperty)
		{
			BulkChassisModel bulkData = new BulkChassisModel();
			List<string> sheetname = new List<string>();
			System.Data.DataTable chassisDT = new System.Data.DataTable();
			System.Data.DataTable InvoiceDT = new System.Data.DataTable();


			string extension = Path.GetExtension(attachment.FileName).ToLower();
			//////////////////////////////////////////////////////////////////////

			byte[] data;
			using (Stream inputStream = attachment.InputStream)
			{
				MemoryStream memoryStream = inputStream as MemoryStream;
				if (memoryStream == null)
				{
					memoryStream = new MemoryStream();
					await inputStream.CopyToAsync(memoryStream);
				}
				data = memoryStream.ToArray();
				memoryStream.Close();
				inputStream.Dispose();
			}
			string fileLocation = string.Empty;
			try
			{
				extension = !string.IsNullOrEmpty(extension) ? extension.ToLower() : string.Empty;
				string fileName = string.Format("{0}{1}", Guid.NewGuid().ToString(), extension);
				string dirPath = string.Empty;

				if (aProperty.Contains("Invoice"))
				{
					dirPath = Server.MapPath("~/Content/UploadChassisInvoice/" + fileName);
				}
				else if (aProperty.Contains("Chassis"))
				{
					dirPath = Server.MapPath("~/Content/UploadChassisInvoice/" + fileName);
				}

				fileLocation = dirPath;

				await Task.Run(() => System.IO.File.WriteAllBytes(fileLocation, data));


				//System.Data.DataTable INDT = ReadExcel(fileLocation, 1);
				//System.Data.DataTable CHDT = ReadExcel(fileLocation, 2);

				///
				DataSet ds = new DataSet();
				DataSet dsInvoice = new DataSet();
				var excelConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + fileLocation + ";Extended Properties=\"Excel 12.0;HDR=YES;IMEX=2\"";// string.Format("Provider=Microsoft.Jet.OLEDB.4.0;Data Source={0};Extended Properties=Excel 8.0", fileLocation);
				OleDbConnection connection = new OleDbConnection();
				connection.ConnectionString = excelConnectionString;

				System.Data.DataTable sheets = await GetSchemaTable(excelConnectionString);
				if (aProperty.Contains("Invoice"))
				{
					sheetname.Add("Invoices$");
				}
				else
				{
					sheetname.Add("Chassis List$");
					sheetname.Add("Invoices$");
				}

				foreach (var r in sheetname)
				{
					string query = "SELECT * FROM [" + r + "]";
					// ds.Clear();
					OleDbDataAdapter daata = new OleDbDataAdapter(query, connection);

					if (r == "Chassis List$")
					{
						daata.Fill(ds);
						chassisDT = ds.Tables[0];
					}
					else if (r == "Invoices$")
					{
						daata.Fill(dsInvoice);
						InvoiceDT = dsInvoice.Tables[0];
					}
				}
				connection.Close();

			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				throw ex;
			}

			try
			{
				//		ReadExcel(fileLocation);
				bulkData = await UploadChassisInvoice(fileLocation, jobNumber, companyCode, userCode, centerCode, apiUrl, chassisDT, InvoiceDT, aProperty);
				return bulkData;
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				throw ex;
			}
			//return response;
			////////////////////////////////////////////////////////////////////////
		}
		private System.Data.DataTable ReadExcel(string file, int sheetNumber)
		{
			System.Data.DataTable dt = new System.Data.DataTable();
			try
			{
				Excel.Application xlApp = new Excel.Application();
				Excel.Workbook xlWorkbook = xlApp.Workbooks.Open(file);
				Excel._Worksheet xlWorksheet = xlWorkbook.Sheets[sheetNumber];
				Excel.Range xlRange = xlWorksheet.UsedRange;

				DataRow row;
				int temp = 1;
				int rowIndex = 1;
				while (((Range)xlWorksheet.Cells[rowIndex, temp]).Value2 != null)
				{
					dt.Columns.Add(Convert.ToString(((Range)xlWorksheet.Cells[rowIndex, temp]).Value2));

					temp++;
				}

				rowIndex = Convert.ToInt32(rowIndex) + 1;

				int columnCount = temp;

				temp = 1;

				while (((Range)xlWorksheet.Cells[rowIndex, temp]).Value2 != null)
				{
					row = dt.NewRow();

					for (int i = 1; i < columnCount; i++)
					{
						row[i - 1] = Convert.ToString(((Range)xlWorksheet.Cells[rowIndex, i]).Value2);
					}
					dt.Rows.Add(row);
					rowIndex = Convert.ToInt32(rowIndex) + 1;
					temp = 1;
				}




				GC.Collect();
				GC.WaitForPendingFinalizers();

				//rule of thumb for releasing com objects:
				//  never use two dots, all COM objects must be referenced and released individually
				//  ex: [somthing].[something].[something] is bad

				//release com objects to fully kill excel process from running in the background
				System.Runtime.InteropServices.Marshal.ReleaseComObject(xlRange);
				System.Runtime.InteropServices.Marshal.ReleaseComObject(xlWorksheet);

				//close and release
				xlWorkbook.Close();
				System.Runtime.InteropServices.Marshal.ReleaseComObject(xlWorkbook);

				//quit and release
				xlApp.Quit();
				System.Runtime.InteropServices.Marshal.ReleaseComObject(xlApp);

			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				string result = ex.ToString();
			}
			return dt;
		}

		public async Task<System.Data.DataTable> GetSchemaTable(string connectionString)
		{
			using (OleDbConnection connection = new
					   OleDbConnection(connectionString))
			{
				try
				{
					await connection.OpenAsync();
					System.Data.DataTable schemaTable = connection.GetOleDbSchemaTable(
						OleDbSchemaGuid.Tables,
						new object[] { null, null, null, "TABLE" });
					return schemaTable;
				}
				catch(Exception ex)
				{
					CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
					connection.Dispose();
					return null;
				}

			}
		}
		public async Task<BulkChassisModel> UploadChassisInvoice(string fileLocation, long jobNumber, string companyCode, string userCode, string centerCode, string apiUrl, System.Data.DataTable ChassisDT, System.Data.DataTable InvoiceDT, string aProperty)
		{
			BulkChassisModel bulkData = new BulkChassisModel();
			try
			{
				//bulkData = await UploadBulkChassis(fileLocation, jobNumber, companyCode, userCode, centerCode, apiUrl, "Chassis List$", ChassisDT,InvoiceDT);
				//	var Data = await UploadBulkChassis(fileLocation, jobNumber, companyCode, userCode, centerCode, apiUrl, "Invoices$", InvoiceDT);

				bulkData = await UploadBulkDataCH_I(fileLocation, jobNumber, companyCode, userCode, centerCode, apiUrl, ChassisDT, InvoiceDT, aProperty);


				if (!string.IsNullOrEmpty(bulkData.Response))
				{
					bulkData.IsError = true;

				}
				//if (!string.IsNullOrEmpty(Data.ResposneInvoice))
				//{
				//	bulkData.IsError = true;
				//	bulkData.ResposneInvoice = Data.ResposneInvoice;
				//}
				//else
				//{
				//	bulkData.IsError = false;
				//	bulkData.Invoices = Data.Invoices;
				//}

				//if ((bulkData.IsError || !Data.IsError))
				//{
				//	bulkData.IsError = false;
				//}

				//if ((bulkData.ResposneChassis == "A blank file cannot be uploaded." && bulkData.ResposneInvoice == "A blank file cannot be uploaded."))
				//{
				//	bulkData.IsError = true;
				//	bulkData.ResposneInvoice = null;
				//}
				//if ((bulkData.ResposneChassis == "The format of an uploaded excel file should be same as the template file."
				//	|| bulkData.ResposneInvoice == "The format of an uploaded excel file should be same as the template file."))
				//{
				//	bulkData.IsError = true;
				//	bulkData.ResposneInvoice = null;
				//}

				try
				{
					await Task.Run(() => System.IO.File.Delete(fileLocation));
				}
				catch (Exception ex) { CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName()); }

				return bulkData;
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				throw ex;
			}
		}
		public async Task<BulkContainerModel> UploadContainer(string fileLocation, long jobNumber, string companyCode, string userCode, string centerCode, string apiUrl, System.Data.DataTable ContainerDT)
		{
			BulkContainerModel bulkData = new BulkContainerModel();
			try
			{
			
				bulkData = await UploadBulkDataCNT(fileLocation, jobNumber, companyCode, userCode, centerCode, apiUrl, ContainerDT);


				if (!string.IsNullOrEmpty(bulkData.Response))
				{
					bulkData.IsError = true;

				}
			
				try
				{
					await Task.Run(() => System.IO.File.Delete(fileLocation));
				}
				catch (Exception ex) { CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName()); }

				return bulkData;
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				throw ex;
			}
		}

		public static System.Data.DataTable ConvertToDataTable(string path, string SheetName)
		{
			System.Data.DataTable dt = null;
			try
			{
				object rowIndex = 1;

				dt = new System.Data.DataTable();

				DataRow row;

				Application app = new Application();

				Workbook workBook = app.Workbooks.Open(path, 0, true, 5, "", "", true,

					XlPlatform.xlWindows, "\t", false, false, 0, true, 1, 0);
				_Worksheet workSheet = (_Worksheet)workBook.Sheets[SheetName];//Invoices

				int temp = 1;

				while (((Range)workSheet.Cells[rowIndex, temp]).Value2 != null)
				{
					dt.Columns.Add(Convert.ToString(((Range)workSheet.Cells[rowIndex, temp]).Value2));

					temp++;
				}

				rowIndex = Convert.ToInt32(rowIndex) + 1;

				int columnCount = temp;

				temp = 1;

				while (((Range)workSheet.Cells[rowIndex, temp]).Value2 != null)
				{
					row = dt.NewRow();

					for (int i = 1; i < columnCount; i++)
					{
						row[i - 1] = Convert.ToString(((Range)workSheet.Cells[rowIndex, i]).Value2);
					}
					dt.Rows.Add(row);
					rowIndex = Convert.ToInt32(rowIndex) + 1;
					temp = 1;
				}
				app.Workbooks.Close();
				return dt;
			}
			catch (Exception ex)
			{
				//CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				throw ex;
			}

		}
		//public async Task<BulkChassisModel> UploadBulkChassis(string file, long jobNumber, string companyCode, string userCode, string centerCode, string apiUrl, string Name, System.Data.DataTable ChassisDT)
		//{
		//	try
		//	{
		//		BulkChassisModel chassisModel = new BulkChassisModel();
		//		if (!string.IsNullOrEmpty(file))
		//		{
		//			System.Data.DataTable chassisDT = new System.Data.DataTable();
		//			chassisDT = ChassisDT;
		//			if (System.IO.File.Exists(file))
		//			{
		//				string templateLocation = System.Web.Hosting.HostingEnvironment.MapPath(String.Format("~/Content/Template/ChassisInvoiceTempl.xltx"));//xltm  //xltx
		//																																					  // 1 for discharge and 3 for loading
		//				DataSet ds = new DataSet();
		//				DataSet templateDS = new DataSet();
		//				// AjaxResponseViewModel response = new AjaxResponseViewModel();
		//				OleDbConnection excelConnection = null;
		//				OleDbConnection excelConnection1 = null;
		//				OleDbConnection templateExcelConnection1 = null;
		//				string fileExtension = System.IO.Path.GetExtension(file);
		//				string excelConnectionString = string.Empty;
		//				string SheetName = Name;
		//				if (fileExtension == ".xls")
		//				{
		//					excelConnectionString = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + file + ";Extended Properties=\"Excel 8.0;HDR=YES;IMEX=2\"";
		//				}
		//				else if (fileExtension == ".xlsx")

		//				{
		//					excelConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + file + ";Extended Properties=\"Excel 12.0;HDR=YES;IMEX=2\"";
		//				}

		//				if (chassisDT != null)
		//				{
		//					String[] excelSheets = new String[chassisDT.Rows.Count];
		//					int t = 0;


		//					// Template check


		//					string templateFileName = templateLocation;
		//					templateFileName = templateFileName.Replace(".xltx", ".xlsx");//xltm  //xltx
		//					string templateExcelConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + templateFileName + ";Extended Properties=\"Excel 12.0;HDR=YES;\"";
		//					OleDbConnection templateExcelConnection = new OleDbConnection(templateExcelConnectionString);
		//					await templateExcelConnection.OpenAsync();
		//					System.Data.DataTable templateDT = new System.Data.DataTable();
		//					System.Data.DataTable templateDTInvoices = new System.Data.DataTable();
		//					templateDT = templateExcelConnection.GetOleDbSchemaTable(OleDbSchemaGuid.Tables, null);

		//					if (templateDT != null)
		//					{
		//						String[] templateExcelSheets = new String[templateDT.Rows.Count];

		//						t = 0;

		//						foreach (DataRow row in templateDT.Rows)
		//						{
		//							templateExcelSheets[t] = row["TABLE_NAME"].ToString();
		//							t++;
		//						}

		//						templateExcelConnection1 = new OleDbConnection(templateExcelConnectionString);

		//						string templateQuery = string.Format("Select * from [{0}]", Name);//"Chassis List$"

		//						using (OleDbDataAdapter dataAdapter = new OleDbDataAdapter(templateQuery, templateExcelConnection1))
		//						{
		//							dataAdapter.Fill(templateDS);
		//						}
		//						templateDT = templateDS.Tables[0];

		//						string sourceColumnName = String.Empty;
		//						string templateColumnName = String.Empty;

		//						if (chassisDT.Rows.Count > 2)
		//						{
		//							for (int i = 0; i < chassisDT.Columns.Count; i++)
		//							{
		//								sourceColumnName = sourceColumnName + chassisDT.Columns[i].ColumnName.ToLower();
		//							}
		//						}

		//						for (int i = 0; i < templateDT.Columns.Count; i++)
		//						{
		//							templateColumnName = templateColumnName + templateDT.Columns[i].ColumnName.ToLower();
		//						}

		//						if (sourceColumnName != templateColumnName)
		//						{
		//							if (Name == "Invoices$")
		//							{
		//								chassisModel.Response = string.Format("The format of an uploaded excel file should be same as the template file.");
		//							}
		//							else
		//							{
		//								chassisModel.Response = string.Format("The format of an uploaded excel file should be same as the template file.");
		//							}

		//							//excelConnection.Close();
		//							//excelConnection1.Close();
		//							//templateExcelConnection.Close();
		//							templateExcelConnection1.Close();
		//							return chassisModel;
		//						}

		//						//Read Excel commodities and insert into Commoditity View Model

		//						List<ChassisDTO> lstChassis = new List<ChassisDTO>();
		//						List<InvoiceDTO> lstInvoiceDTO = new List<InvoiceDTO>();
		//						chassisModel.JobNumber = jobNumber;
		//						chassisModel.CompanyCode = companyCode;
		//						chassisModel.UserCode = userCode;
		//						chassisModel.CenterCode = centerCode;

		//						String errorResponse = String.Empty;

		//						// List<GCBillOfLadingViewModel> items = new List<GCBillOfLadingViewModel>();
		//						try
		//						{
		//							if (Name != "Invoices$")
		//							{
		//								errorResponse = ReadChassis(chassisDT, ref lstChassis);
		//							}
		//							else
		//							{
		//								errorResponse = ReadInvoices(chassisDT, ref lstInvoiceDTO);

		//							}
		//						}
		//						catch (Exception ex)
		//						{
		//							throw ex;
		//						}

		//						if (!String.IsNullOrEmpty(errorResponse))
		//						{
		//							if (Name == "Invoices$")
		//							{
		//								chassisModel.ResposneInvoice = errorResponse;
		//							}
		//							else
		//							{
		//								chassisModel.ResposneChassis = errorResponse;
		//							}
		//							//excelConnection.Close();
		//							//excelConnection1.Close();
		//							templateExcelConnection1.Close();
		//							//templateExcelConnection.Close();
		//							return chassisModel;
		//						}



		//						if (Name == "Invoices$")
		//						{
		//							chassisModel.Invoices = lstInvoiceDTO;
		//						}
		//						else
		//						{
		//							chassisModel.Chassises = lstChassis;

		//						}

		//						// Integration service will call here ....................
		//						return chassisModel;
		//					}
		//				}
		//			}

		//		}
		//		return null;
		//	}
		//	catch (Exception ex)
		//	{

		//		throw ex;
		//	}
		//}

		public async Task<BulkChassisModel> UploadBulkDataCH_I(string file, long jobNumber, string companyCode, string userCode, string centerCode, string apiUrl, System.Data.DataTable ChassisDT, System.Data.DataTable InvoiceDT, string aProperty)
		{
			try
			{
				System.Data.DataTable chassisDT = new System.Data.DataTable();
				System.Data.DataTable invoiceDT = new System.Data.DataTable();
				DataSet chassisDataSet = new DataSet();
				DataSet invoiceDataSet = new DataSet();
				System.Data.DataTable chassisTemplateDT = new System.Data.DataTable();
				System.Data.DataTable invoiceTemplateDT = new System.Data.DataTable();
				System.Data.DataTable templateDTInvoices = new System.Data.DataTable();
				string templateExcelConnectionString = String.Empty;
				string templateFileName = String.Empty;
				OleDbConnection templateExcelConnection1 = null;
				string sourceChassisColumn = String.Empty;
				string sourceInvoiceColumn = String.Empty;
				string templateChassisColumn = String.Empty;
				string templateInvoiceColumn = String.Empty;
				List<ChassisDTO> lstChassis = new List<ChassisDTO>();
				List<InvoiceDTO> lstInvoiceDTO = new List<InvoiceDTO>();
				string templateLocation = String.Empty;
				string excelConnectionString = string.Empty;
				string fileExtension = String.Empty;


				BulkChassisModel chassisModel = new BulkChassisModel();

				if (!string.IsNullOrEmpty(file))
				{
					invoiceDT = InvoiceDT;
					chassisDT = ChassisDT;
					if (System.IO.File.Exists(file))
					{
						if (aProperty.Contains("Invoice"))
						{
							templateLocation = System.Web.Hosting.HostingEnvironment.MapPath(String.Format("~/Content/Template/InvoiceTemplate.xltx"));//xltm  //xltx
						}
						else
						{
							templateLocation = System.Web.Hosting.HostingEnvironment.MapPath(String.Format("~/Content/Template/ChassisInvoiceTempl.xltx"));//xltm  //xltx
						}

						fileExtension = System.IO.Path.GetExtension(file);

						if (fileExtension == ".xls")
						{
							excelConnectionString = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + file + ";Extended Properties=\"Excel 8.0;HDR=YES;IMEX=2\"";
						}
						else if (fileExtension == ".xlsx")
						{
							excelConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + file + ";Extended Properties=\"Excel 12.0;HDR=YES;IMEX=2\"";
						}

						if (chassisDT != null)
						{
							String[] excelSheets = new String[chassisDT.Rows.Count];
							int t = 0;

							templateFileName = templateLocation;
							templateFileName = templateFileName.Replace(".xltx", ".xlsx");//xltm  //xltx
							templateExcelConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + templateFileName + ";Extended Properties=\"Excel 12.0;HDR=YES;\"";
							OleDbConnection templateExcelConnection = new OleDbConnection(templateExcelConnectionString);
							await templateExcelConnection.OpenAsync();
							chassisTemplateDT = templateExcelConnection.GetOleDbSchemaTable(OleDbSchemaGuid.Tables, null);
							invoiceTemplateDT = templateExcelConnection.GetOleDbSchemaTable(OleDbSchemaGuid.Tables, null);

							if (chassisTemplateDT != null)
							{
								String[] templateExcelSheets = new String[chassisTemplateDT.Rows.Count];

								t = 0;

								foreach (DataRow row in chassisTemplateDT.Rows)
								{
									templateExcelSheets[t] = row["TABLE_NAME"].ToString();
									t++;
								}

								templateExcelConnection1 = new OleDbConnection(templateExcelConnectionString);
								string chassisQuery = string.Empty;
								string invoiceQuery = string.Empty;
								if (aProperty.Contains("Invoice"))
								{
									invoiceQuery = string.Format("Select * from [{0}]", "Invoices$");//"Chassis List$"
								}
								else
								{
									chassisQuery = string.Format("Select * from [{0}]", "Chassis List$");//"Chassis List$"
									invoiceQuery = string.Format("Select * from [{0}]", "Invoices$");//"Chassis List$"

									using (OleDbDataAdapter dataAdapter = new OleDbDataAdapter(chassisQuery, templateExcelConnection1))
									{
										dataAdapter.Fill(chassisDataSet);
									}
									chassisTemplateDT = chassisDataSet.Tables[0];
								}


								using (OleDbDataAdapter dataAdapter = new OleDbDataAdapter(invoiceQuery, templateExcelConnection1))
								{
									dataAdapter.Fill(invoiceDataSet);
								}
								//chassisTemplateDT = chassisDataSet.Tables[0];
								invoiceTemplateDT = invoiceDataSet.Tables[0];


								if (chassisDT.Rows.Count > 2)
								{
									for (int i = 0; i < chassisDT.Columns.Count; i++)
									{
										sourceChassisColumn = sourceChassisColumn + chassisDT.Columns[i].ColumnName.ToLower();
									}
								}

								if (invoiceDT.Rows.Count > 2)
								{
									for (int i = 0; i < invoiceDT.Columns.Count; i++)
									{
										sourceInvoiceColumn = sourceInvoiceColumn + invoiceDT.Columns[i].ColumnName.ToLower();
									}
								}

								if (!aProperty.Contains("Invoice"))
								{
									for (int i = 0; i < chassisTemplateDT.Columns.Count; i++)
									{
										templateChassisColumn = templateChassisColumn + chassisTemplateDT.Columns[i].ColumnName.ToLower();
									}
								}
								for (int i = 0; i < invoiceTemplateDT.Columns.Count; i++)
								{
									templateInvoiceColumn = templateInvoiceColumn + invoiceTemplateDT.Columns[i].ColumnName.ToLower();
								}

								if (sourceChassisColumn != templateChassisColumn)
								{
									chassisModel.Response = string.Format("The format of an uploaded excel file sheet Chassis List should be same as the template file.");
									templateExcelConnection1.Close();
									return chassisModel;
								}
								else if (sourceInvoiceColumn != templateInvoiceColumn)
								{
									chassisModel.Response = string.Format("The format of an uploaded excel file sheet Invoice should be same as the template file.");
									templateExcelConnection1.Close();
									return chassisModel;
								}

								//Read Excel commodities and insert into Commoditity View Model


								chassisModel.JobNumber = jobNumber;
								chassisModel.CompanyCode = companyCode;
								chassisModel.UserCode = userCode;
								chassisModel.CenterCode = centerCode;
								String errorResponse = String.Empty;

								try
								{
									errorResponse = ReadChassis(chassisDT, ref lstChassis);
									if (String.IsNullOrEmpty(errorResponse))
									{
										chassisModel.Chassises = lstChassis;
										errorResponse = ReadInvoices(invoiceDT, ref lstInvoiceDTO);
									}

								}
								catch (Exception ex)
								{
									CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
									throw ex;
								}

								if (!String.IsNullOrEmpty(errorResponse))
								{
									chassisModel.Response = errorResponse;
									templateExcelConnection1.Close();
									return chassisModel;
								}
								else
								{
									if (lstChassis.Count == 0 && lstInvoiceDTO.Count == 0)
									{
										chassisModel.Response = "A blank file can't be uploaded.";
										templateExcelConnection1.Close();
										return chassisModel;
									}
									//else if (lstChassis.Count > 4000) //As per Mudassar
									//{
									//	chassisModel.Response = "Number of chassis entries can't exceed 4000 limit";
									//	templateExcelConnection1.Close();
									//	return chassisModel;

									//}
									//else if (lstInvoiceDTO.Count > 1000)
									//{
									//	chassisModel.Response = "Number of invoice entries can't exceed 1000 limit";
									//	templateExcelConnection1.Close();
									//	return chassisModel;
									//}
									chassisModel.Invoices = lstInvoiceDTO;
								}

								return chassisModel;
							}
						}
					}

				}
				return null;
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				throw ex;
			}
		}

		public async Task<BulkContainerModel> UploadBulkDataCNT(string file, long jobNumber, string companyCode, string userCode, string centerCode, string apiUrl, System.Data.DataTable ContainerDT)
		{
			try
			{
				System.Data.DataTable containerDT = new System.Data.DataTable();
				DataSet containerDataSet = new DataSet();
				System.Data.DataTable containerTemplateDT = new System.Data.DataTable();
				string templateExcelConnectionString = String.Empty;
				string templateFileName = String.Empty;
				OleDbConnection templateExcelConnection1 = null;
				string sourceContainerColumn = String.Empty;
				string templateContainerColumn = String.Empty;
				List<ContainerDTO> lstContainer = new List<ContainerDTO>();
				string templateLocation = String.Empty;
				string excelConnectionString = string.Empty;
				string fileExtension = String.Empty;


				BulkContainerModel containerModel = new BulkContainerModel();

				if (!string.IsNullOrEmpty(file))
				{
					containerDT = ContainerDT;
					if (System.IO.File.Exists(file))
					{
						templateLocation = System.Web.Hosting.HostingEnvironment.MapPath(String.Format("~/Content/Template/Container_Template.xltx"));//xltm  //xltx
						//if (aProperty.Contains("Container"))
						//{
						//	templateLocation = System.Web.Hosting.HostingEnvironment.MapPath(String.Format("~/Content/Template/ContainerTemplate.xltx"));//xltm  //xltx
						//}
						//else
						//{
						//	templateLocation = System.Web.Hosting.HostingEnvironment.MapPath(String.Format("~/Content/Template/ChassisInvoiceTempl.xltx"));//xltm  //xltx
						//}

						fileExtension = System.IO.Path.GetExtension(file);

						if (fileExtension == ".xls")
						{
							excelConnectionString = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + file + ";Extended Properties=\"Excel 8.0;HDR=YES;IMEX=2\"";
						}
						else if (fileExtension == ".xlsx")
						{
							excelConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + file + ";Extended Properties=\"Excel 12.0;HDR=YES;IMEX=2\"";
						}

						if (containerDT != null)
						{
							String[] excelSheets = new String[containerDT.Rows.Count];
							int t = 0;

							templateFileName = templateLocation;
							templateFileName = templateFileName.Replace(".xltx", ".xlsx");//xltm  //xltx
							templateExcelConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + templateFileName + ";Extended Properties=\"Excel 12.0;HDR=YES;\"";
							OleDbConnection templateExcelConnection = new OleDbConnection(templateExcelConnectionString);
							await templateExcelConnection.OpenAsync();
							containerTemplateDT = templateExcelConnection.GetOleDbSchemaTable(OleDbSchemaGuid.Tables, null);
						
							if (containerTemplateDT != null)
							{
								String[] templateExcelSheets = new String[containerTemplateDT.Rows.Count];

								t = 0;

								foreach (DataRow row in containerTemplateDT.Rows)
								{
									templateExcelSheets[t] = row["TABLE_NAME"].ToString();
									t++;
								}

								templateExcelConnection1 = new OleDbConnection(templateExcelConnectionString);
								string containerQuery = string.Empty;


								containerQuery = string.Format("Select * from [{0}]", "CONTAINERS$");//"Chassis List$"

								using (OleDbDataAdapter dataAdapter = new OleDbDataAdapter(containerQuery, templateExcelConnection1))
								{
									dataAdapter.Fill(containerDataSet);
								}
								containerTemplateDT = containerDataSet.Tables[0];
								

								if (containerDT.Rows.Count > 2)
								{
									for (int i = 0; i < containerDT.Columns.Count; i++)
									{
										sourceContainerColumn = sourceContainerColumn + containerDT.Columns[i].ColumnName.ToLower();
									}
								}

								for (int i = 0; i < containerTemplateDT.Columns.Count; i++)
								{
									templateContainerColumn = templateContainerColumn + containerTemplateDT.Columns[i].ColumnName.ToLower();
								}

								

								if (sourceContainerColumn != templateContainerColumn)
								{
									containerModel.Response = string.Format("The format of an uploaded excel file sheet Container List should be same as the template file.");
									templateExcelConnection1.Close();
									return containerModel;
								}

								//Read Excel commodities and insert into Commoditity View Model


								containerModel.JobNumber = jobNumber;
								containerModel.CompanyCode = companyCode;
								containerModel.UserCode = userCode;
								containerModel.CenterCode = centerCode;
								String errorResponse = String.Empty;

								try
								{
									errorResponse = ReadContainer(containerDT, ref lstContainer);
									

								}
								catch (Exception ex)
								{
									CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
									throw ex;
								}

								if (!String.IsNullOrEmpty(errorResponse))
								{
									containerModel.Response = errorResponse;
									templateExcelConnection1.Close();
									return containerModel;
								}
								else
								{
									if (lstContainer.Count == 0)
									{
										containerModel.Response = "A blank file can't be uploaded.";
										templateExcelConnection1.Close();
										return containerModel;
									}
									else if (lstContainer.Count > 4000)
									{
										containerModel.Response = "Number of container entries can't exceed 4000 limit";
										templateExcelConnection1.Close();
										return containerModel;

									}

									containerModel.Containers = lstContainer;
								}

								return containerModel;
							}
						}
					}

				}
				return null;
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				throw ex;
			}
		}

		public string ReadChassis(System.Data.DataTable datatable, ref List<ChassisDTO> chassisList)
		{
			string errorResponse = String.Empty;

			int terminateCount = 0;
			int rowCount = 1;
			string newLine = "&#10;-";
			string modelYear = String.Empty;
			string cylinder = String.Empty;
			string payLoad = String.Empty;
			string weight = String.Empty;
			string noOfChair = String.Empty;
			string noOfAxil = String.Empty;
			string priceCIF = string.Empty;
			string noOfWheel = String.Empty;
			string trafficNumber = String.Empty;
			string uaeID = String.Empty;

			for (int j = 0; j < datatable.Rows.Count; j++)
			{
				rowCount++;

				ChassisDTO chassis = new ChassisDTO();

				// Check to terminate file reading
				if (String.IsNullOrEmpty(datatable.Rows[j][0].ToString()) && String.IsNullOrEmpty(datatable.Rows[j][1].ToString()) && String.IsNullOrEmpty(datatable.Rows[j][2].ToString()) && String.IsNullOrEmpty(datatable.Rows[j][3].ToString()))
				{
					terminateCount++; if (terminateCount == 5) break; else { continue; }
				}
				else terminateCount = 0;

				chassis.RNum = rowCount;

				chassis.BodyTypeCode = datatable.Rows[j][6].ToString().Trim();
				chassis.SubTypeCode = datatable.Rows[j][7].ToString().Trim();
				chassis.CountryCode = datatable.Rows[j][2].ToString().Trim();
				chassis.UAEID = datatable.Rows[j][10].ToString().Trim();
				chassis.ColorCode = datatable.Rows[j][4].ToString().Trim();
				chassis.PoliceColorCode = datatable.Rows[j][5].ToString().Trim(); //datatable.Rows[j][5].ToString() != "" ? Convert.ToInt32(datatable.Rows[j][5].ToString()) : chassis.PoliceColorCode; //datatable.Rows[j][5].ToString();
				chassis.VehicleSpecification = datatable.Rows[j][8].ToString();
				chassis.PatrolType = datatable.Rows[j][15].ToString().Trim();
				chassis.NumberOfDoors = datatable.Rows[j][16].ToString().Trim();
				chassis.TransmissionType = datatable.Rows[j][18].ToString().Trim();
				chassis.EnginePower = datatable.Rows[j][20].ToString().Trim();
				chassis.SteeringType = datatable.Rows[j][21].ToString().Trim();
				chassis.VehicleRemarks = datatable.Rows[j][22].ToString().Trim();
				chassis.AgentRemarks = datatable.Rows[j][23].ToString().Trim();
				chassis.CurrencyCode = datatable.Rows[j][24].ToString().Trim();


				#region Chassis Number
				chassis.ChassisNumber = datatable.Rows[j][0].ToString().Trim();

				if (String.IsNullOrEmpty(chassis.ChassisNumber))
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Chassis Number at (Row No. {rowCount}).";
				}
				else
				{
					if (IsSpecialCharExist(chassis.ChassisNumber) || chassis.ChassisNumber.Length > 30 || chassis.ChassisNumber == "0")
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Chassis Number: {chassis.ChassisNumber} at (Row No. {rowCount}).";
					}
				}
				#endregion

				#region EngineNumber
				chassis.EngineNumber = datatable.Rows[j][1].ToString().Trim();
				if (String.IsNullOrEmpty(chassis.EngineNumber))
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Engine Number at (Row No. {rowCount}).";
				}
				else
				{
					if (IsSpecialCharExist(chassis.EngineNumber) || chassis.EngineNumber.Length > 30 || chassis.EngineNumber == "0")
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Engine Number: {chassis.EngineNumber} at (Row No. {rowCount}).";
					}
				}
				#endregion

				#region Traffic Number
				trafficNumber = datatable.Rows[j][9].ToString().Trim();

				if (!String.IsNullOrEmpty(trafficNumber))
				{
					try
					{
						chassis.TrafficNumber = Convert.ToInt64(trafficNumber);
						if (trafficNumber.Length > 10 || chassis.TrafficNumber == 0)
						{
							errorResponse = $"{errorResponse} {newLine} Invalid Traffic Number: {chassis.TrafficNumber} at (Row No. {rowCount}).";
						}

					}
					catch(Exception ex)
					{
						CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
						errorResponse = $"{errorResponse} {newLine} Invalid Traffic Number: {trafficNumber} at (Row No. {rowCount}).";
					}
				}
				#endregion

				#region UAE
				if (!String.IsNullOrEmpty(chassis.UAEID))
				{
					try
					{
						long uae = Convert.ToInt64(chassis.UAEID);
					}
					catch
					{
						errorResponse = $"{errorResponse} {newLine} Invalid UAE ID value: {chassis.UAEID} at (Row No. {rowCount}).";
					}

					if (chassis.UAEID.Length != 15)
					{
						errorResponse = $"{errorResponse} {newLine} Invalid UAE ID value: {chassis.UAEID} at (Row No. {rowCount}).";
					}
				}
				#endregion

				#region Model Year
				modelYear = datatable.Rows[j][3].ToString().Trim();
				try
				{

					chassis.ModelYear = modelYear != "" ? Convert.ToInt32(modelYear) : chassis.ModelYear;
				}
				catch
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Model Year: {modelYear} at (Row No. {rowCount}).";
					//				break;
				}
				#endregion

				#region Cylinder
				cylinder = datatable.Rows[j][11].ToString().Trim();
				try
				{
					chassis.Cylinders = cylinder != "" ? Convert.ToInt32(cylinder) : chassis.Cylinders;
				}
				catch
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Cylinder Value: {cylinder} at (Row No. {rowCount}).";
					//			break;
				}
				#endregion

				#region PayLoad
				payLoad = datatable.Rows[j][12].ToString().Trim();
				try
				{
					chassis.PayLoad = payLoad != "" ? Convert.ToInt32(payLoad) : chassis.PayLoad;

					if (chassis.PayLoad.ToString().Length > 6 || chassis.PayLoad < 0 || chassis.PayLoad == 0)
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Payload Value: {payLoad} at (Row No. {rowCount}).";
					}
				}
				catch
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Payload Value: {payLoad} at (Row No. {rowCount}).";
				}

				#endregion

				#region Weight
				weight = datatable.Rows[j][13].ToString().Trim();
				try
				{
					chassis.Weight = weight != "" ? Convert.ToInt64(weight) : chassis.Weight;
					if (chassis.Weight < 0 || chassis.Weight == 0 || chassis.Weight.ToString().Length > 6)
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Weight Value: {weight} at (Row No. {rowCount}).";
					}

				}
				catch
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Weight Value: {weight} at (Row No. {rowCount}).";
				}

				#endregion

				#region Passenger
				noOfChair = datatable.Rows[j][14].ToString().Trim();
				try
				{
					chassis.NumberOfChairs = noOfChair != "" ? Convert.ToInt32(noOfChair) : chassis.NumberOfChairs;
					if (chassis.NumberOfChairs.ToString().Length > 3 || chassis.NumberOfChairs < 0 || chassis.NumberOfChairs == 0)
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Passengers Value: {noOfChair} at (Row No. {rowCount}).";
					}

				}
				catch
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Passengers Value: {noOfChair} at (Row No. {rowCount}).";
				}
				#endregion

				#region Axil
				noOfAxil = datatable.Rows[j][19].ToString().Trim();
				try
				{
					chassis.NumberOfAxils = noOfAxil != "" ? Convert.ToInt32(noOfAxil) : chassis.NumberOfAxils;

					if (chassis.NumberOfAxils < 0 || chassis.NumberOfAxils == 0)
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Number of Axil Value: {noOfAxil} at (Row No. {rowCount}).";
					}
				}
				catch
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Number of Axil Value: {noOfAxil} at (Row No. {rowCount}).";
					//			break;
				}
				#endregion

				#region Price CIF 
				priceCIF = datatable.Rows[j][25].ToString().Trim();
				if (String.IsNullOrEmpty(priceCIF))
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Price CIF value at (Row No. {rowCount}).";
				}
				else
				{
					chassis.PriceCIF = Math.Round(Convert.ToDecimal(priceCIF), 3);
					if (Regex.IsMatch(chassis.PriceCIF.ToString(), @"(^[0-9]{1,12}\.[0-9]{0,3}$)|(^[0-9]{1,12}$)"))
					{
						try
						{
							if (chassis.PriceCIF == 0 || chassis.PriceCIF < 0)
							{
								errorResponse = $"{errorResponse} {newLine} Invalid Price CIF value: {priceCIF} at (Row No. {rowCount}).";
							}
						}
						catch
						{
							errorResponse = $"{errorResponse} {newLine} Invalid Price CIF value: {priceCIF} at (Row No. {rowCount}).";
						}
					}
					else
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Price CIF value: {priceCIF} at (Row No. {rowCount}).";
					}


				}
				#endregion


				#region Wheel
				noOfWheel = datatable.Rows[j][17].ToString().Trim();
				try
				{
					chassis.NumberOfWheels = noOfWheel != "" ? Convert.ToInt32(noOfWheel) : chassis.NumberOfWheels;

					if (chassis.NumberOfWheels.ToString().Length > 3 || chassis.NumberOfWheels == 0 || chassis.NumberOfWheels < 0)
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Number of Wheel Value: {noOfWheel} at (Row No. {rowCount}).";
					}
				}
				catch
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Wheel number value: {noOfWheel} at (Row No. {rowCount}).";
				}
				#endregion

				chassisList.Add(chassis);
			}
			return errorResponse;
		}

		public string ReadContainer(System.Data.DataTable datatable, ref List<ContainerDTO> containerList)
		{
			string errorResponse = String.Empty;

			int terminateCount = 0;
			int rowCount = 1;
			string newLine = "&#10;-";
			string weight = String.Empty;
			string measure = String.Empty;
			string size = String.Empty;
		
			for (int j = 0; j < datatable.Rows.Count; j++)
			{
				rowCount++;

				ContainerDTO container = new ContainerDTO();

				// Check to terminate file reading
				if (String.IsNullOrEmpty(datatable.Rows[j][0].ToString()) && String.IsNullOrEmpty(datatable.Rows[j][1].ToString()) && String.IsNullOrEmpty(datatable.Rows[j][2].ToString()) && String.IsNullOrEmpty(datatable.Rows[j][3].ToString()))
				{
					terminateCount++; if (terminateCount == 5) break; else { continue; }
				}
				else terminateCount = 0;
				container.RowNumber = rowCount;
				
				//chassis.RNum = rowCount;
				//

				#region Container Number
				container.ContainerNumber = datatable.Rows[j][0].ToString().Trim();

				if (String.IsNullOrEmpty(container.ContainerNumber))
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Container Number at (Row No. {rowCount}).";
				}
				else
				{
					if (IsSpecialCharExist(container.ContainerNumber) || !InCorrectContainerNo(container.ContainerNumber))
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Container Number: {container.ContainerNumber} at (Row No. {rowCount}).";
					}
				}
				#endregion

				#region Seal
				container.SealNumber = datatable.Rows[j][1].ToString().Trim();
				if (!String.IsNullOrEmpty(container.SealNumber))
				{
					if (IsSpecialCharExist(container.SealNumber) || container.SealNumber.Length > 20 || Regex.IsMatch(container.SealNumber.ToString(), @"(\s)"))
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Seal Number: {container.SealNumber} at (Row No. {rowCount}).";
					}
					
				}
				#endregion

				#region Size
				size = datatable.Rows[j][2].ToString().Trim();
				try
				{
					container.Size = size != "" ? Convert.ToInt32(size) : container.Size;

					if (container.Size.ToString().Length > 2 || container.Size == 0 || container.Size < 0)
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Size Value: {size} at (Row No. {rowCount}).";
					}
				}
				catch
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Size value: {size} at (Row No. {rowCount}).";
				}
				#endregion

				#region Service

				container.Service = datatable.Rows[j][3].ToString().Trim();
				if (!String.IsNullOrEmpty(container.Service))
				{
					if (container.Service.Length > 5)
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Service: {container.Service} at (Row No. {rowCount}).";
					}

				}

				#endregion

				#region Weight
				weight = datatable.Rows[j][4].ToString().Trim();
				if (!String.IsNullOrEmpty(weight))
				{
					try
					{
						container.Weight = Math.Round(Convert.ToDecimal(weight), 3);
						if (Regex.IsMatch(container.Weight.ToString(), @"(^[0-9]{1,12}\.[0-9]{0,3}$)|(^[0-9]{1,12}$)"))
						{
							try
							{
								if (container.Weight == 0 || container.Weight < 0)
								{
									errorResponse = $"{errorResponse} {newLine} Invalid Weight value: {weight} at (Row No. {rowCount}).";
								}
							}
							catch
							{
								errorResponse = $"{errorResponse} {newLine} Invalid Weight value: {weight} at (Row No. {rowCount}).";
							}
						}
						else
						{
							errorResponse = $"{errorResponse} {newLine} Invalid Weight value: {weight} at (Row No. {rowCount}).";
						}
					}
					catch {
						errorResponse = $"{errorResponse} {newLine} Invalid Weight value: {weight} at (Row No. {rowCount}).";
					}
				}
				#endregion

				#region Measure
				measure = datatable.Rows[j][5].ToString().Trim();
				if (!String.IsNullOrEmpty(measure))
				{
					try
					{
						container.Measure = Math.Round(Convert.ToDecimal(measure), 3);
						if (Regex.IsMatch(container.Measure.ToString(), @"(^[0-9]{1,12}\.[0-9]{0,3}$)|(^[0-9]{1,12}$)"))
						{
							try
							{
								if (container.Measure == 0 || container.Measure < 0)
								{
									errorResponse = $"{errorResponse} {newLine} Invalid Measure value: {measure} at (Row No. {rowCount}).";
								}
							}
							catch
							{
								errorResponse = $"{errorResponse} {newLine} Invalid Measure value: {measure} at (Row No. {rowCount}).";
							}
						}
						else
						{
							errorResponse = $"{errorResponse} {newLine} Invalid Measure value: {measure} at (Row No. {rowCount}).";
						}
					}
					catch
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Measure value: {measure} at (Row No. {rowCount}).";
					}
				}
				#endregion

				#region Remarks

				container.Remarks = datatable.Rows[j][6].ToString().Trim();
				if (!String.IsNullOrEmpty(container.Remarks))
				{
					if (container.Remarks.Length > 50)
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Remarks: {container.Remarks} at (Row No. {rowCount}).";
					}

				}

				#endregion
				containerList.Add(container);
			}
			return errorResponse;
		}

		public string ReadInvoices(System.Data.DataTable datatable, ref List<InvoiceDTO> InvoiceDTOList)
		{
			string errorResponse = String.Empty;

			int terminateCount = 0;
			int rowCount = 1;
			string newLine = "&#10;-";
			string invoiceNumber = String.Empty;
			string invoiceRefNumber = String.Empty;
			string quantity = String.Empty;
			string netWeight = String.Empty;
			string grossWeight = String.Empty;
			string invoiceAmount = String.Empty;
			string frieghtAmount = String.Empty;
			string InsuranceAmount = String.Empty;
			string freightCurrency = String.Empty;
			string incoterm = String.Empty;
			string currency = String.Empty;
			string countryOfOrigin = String.Empty;
			string description = String.Empty;
			string hsCode = String.Empty;

			for (int j = 0; j < datatable.Rows.Count; j++)
			{
				// Check to terminate file reading
				if (String.IsNullOrEmpty(datatable.Rows[j][0].ToString()) && String.IsNullOrEmpty(datatable.Rows[j][1].ToString()) && String.IsNullOrEmpty(datatable.Rows[j][2].ToString()) && String.IsNullOrEmpty(datatable.Rows[j][3].ToString()))
				{
					terminateCount++; if (terminateCount == 5) break; else { continue; }
				}
				else terminateCount = 0;


				InvoiceDTO invoiceDTO = new InvoiceDTO();
				rowCount++;
				invoiceDTO.RNum = rowCount;

				description = invoiceDTO.Description = Convert.ToString(datatable.Rows[j][2]).Trim();
				freightCurrency = invoiceDTO.FreightCurrency = datatable.Rows[j][10].ToString().Trim();

				#region Currency
				currency = invoiceDTO.Currency = datatable.Rows[j][7].ToString().Trim();
				if (String.IsNullOrEmpty(currency))
				{
					errorResponse = $"{errorResponse} {newLine} Invaid Currency value at (Row No. {rowCount}).";
				}
				#endregion


				#region INCOTERM
				incoterm = invoiceDTO.INCOTERM = datatable.Rows[j][8].ToString().Trim();
				if (String.IsNullOrEmpty(incoterm))
				{
					errorResponse = $"{errorResponse} {newLine} Invalid INCOTERM value at (Row No. {rowCount}).";
				}

				#endregion

				#region Invoice Number
				invoiceNumber = datatable.Rows[j][0].ToString().Trim();
				if (String.IsNullOrEmpty(invoiceNumber))
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Invoice Number at (Row No. {rowCount}).";
				}
				else
				{
					if (IsSpecialCharExist(invoiceNumber) || invoiceNumber == "0")
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Invoice Number: {invoiceNumber} at (Row No. {rowCount}).";
					}
					else
					{
						invoiceDTO.InoviceNumber = invoiceNumber;
					}
				}

				#endregion

				#region HS Code 
				hsCode = datatable.Rows[j][1].ToString().Trim();
				if (String.IsNullOrEmpty(hsCode))
				{
					errorResponse = $"{errorResponse} {newLine} Invalid HS code at (Row No. {rowCount}).";
				}
				else
				{
					try
					{
						Convert.ToInt64(hsCode);
						invoiceDTO.HSCode = hsCode;
						if (hsCode.Length != 8)
						{
							errorResponse = $"{errorResponse} {newLine} Invalid HS Code: {hsCode} at (Row No. {rowCount}).";
						}
					}
					catch
					{
						errorResponse = $"{errorResponse} {newLine} Invalid HS Code Number: {hsCode} at (Row No. {rowCount}).";
					}

				}

				#endregion

				#region Country Of Origin
				countryOfOrigin = invoiceDTO.CountryOfOrigin = datatable.Rows[j][3].ToString().Trim();
				if (String.IsNullOrEmpty(countryOfOrigin))
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Country Of Origin at (Row No. {rowCount}).";
				}


				#endregion


				#region Quantity
				quantity = datatable.Rows[j][4].ToString().Trim();
				if (String.IsNullOrEmpty(quantity))
				{
					errorResponse = $"{errorResponse} {newLine} Quantity can't be empty at (Row No. {rowCount}).";
				}
				else
				{
					try
					{
						invoiceDTO.Quantity = Convert.ToInt64(quantity);
						if (invoiceDTO.Quantity == 0 || invoiceDTO.Quantity < 0 || invoiceDTO.Quantity.ToString().Length > 8)
						{
							errorResponse = $"{errorResponse} {newLine} Invalid Quantity: {quantity} at (Row No. {rowCount}).";
						}
					}
					catch
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Quantity value: {quantity} at (Row No. {rowCount}).";
					}
				}
				#endregion

				#region Net Weight
				netWeight = datatable.Rows[j][5].ToString().Trim();
				if (String.IsNullOrEmpty(netWeight))
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Net Weight at (Row No. {rowCount}).";
				}
				else
				{
					try
					{
						invoiceDTO.NetWeight = Math.Round(Convert.ToDecimal(netWeight), 3);
						if (Regex.IsMatch(invoiceDTO.NetWeight.ToString(), @"(^[0-9]{1,9}\.[0-9]{0,3}$)|(^[0-9]{1,9}$)"))
						{
							if (invoiceDTO.NetWeight == 0 || invoiceDTO.NetWeight < 0)
							{
								errorResponse = $"{errorResponse} {newLine} Invalid Net Weight: {netWeight} at (Row No. {rowCount}).";
							}
						}
						else
						{
							errorResponse = $"{errorResponse} {newLine} Invalid Net Weight: {netWeight} at (Row No. {rowCount}).";
						}
					}
					catch
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Net Weight: {netWeight} at (Row No. {rowCount}).";
					}
				}
				#endregion

				#region Gross Weight
				grossWeight = datatable.Rows[j][6].ToString().Trim();
				if (String.IsNullOrEmpty(grossWeight))
				{

					errorResponse = $"{errorResponse} {newLine} Invalid Gross Weight at (Row No. {rowCount}).";
				}
				else
				{
					try
					{
						invoiceDTO.GrossWeight = Math.Round(Convert.ToDecimal(grossWeight), 3);

						if (Regex.IsMatch(invoiceDTO.GrossWeight.ToString(), @"(^[0-9]{1,9}\.[0-9]{0,3}$)|(^[0-9]{1,9}$)"))
						{
							if (invoiceDTO.GrossWeight == 0 || invoiceDTO.GrossWeight < 0)
							{
								errorResponse = $"{errorResponse} {newLine} Invalid Gross Weight: {grossWeight} at (Row No. {rowCount}).";
							}
						}
						else
						{
							errorResponse = $"{errorResponse} {newLine} Invalid Gross Weight: {grossWeight} at (Row No. {rowCount}).";
						}
					}
					catch
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Gross Weight: {grossWeight} at (Row No. {rowCount}).";
					}
				}

				#endregion

				#region Invoice Amount
				invoiceAmount = datatable.Rows[j][9].ToString().Trim();
				if (String.IsNullOrEmpty(invoiceAmount))
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Invoice Amount at (Row No. {rowCount}).";
				}
				else
				{
					try
					{
						invoiceDTO.InvoiceAmount = Math.Round(Convert.ToDecimal(invoiceAmount), 3);
						if (Regex.IsMatch(invoiceDTO.InvoiceAmount.ToString(), @"(^[0-9]{1,11}\.[0-9]{0,3}$)|(^[0-9]{1,11}$)"))
						{
							if (invoiceDTO.InvoiceAmount == 0 || invoiceDTO.InvoiceAmount < 0)
							{
								errorResponse = $"{errorResponse} {newLine} Invalid Invoice Amount: {invoiceAmount} at (Row No. {rowCount}).";
							}
						}
						else
						{
							errorResponse = $"{errorResponse} {newLine} Invalid Invoice Amount: {invoiceAmount} at (Row No. {rowCount}).";
						}
					}
					catch
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Invoice Amount: {invoiceAmount} at (Row No. {rowCount}).";
					}
				}
				#endregion

				#region Frieght Amount
				frieghtAmount = datatable.Rows[j][11].ToString().Trim();
				if (!String.IsNullOrEmpty(frieghtAmount))
				{

					if (!String.IsNullOrEmpty(freightCurrency))
					{
						try
						{
							invoiceDTO.FreightAmount = Math.Round(Convert.ToDecimal(frieghtAmount), 2);
							if (Regex.IsMatch(invoiceDTO.FreightAmount.ToString(), @"(^[0-9]{1,11}\.[0-9]{0,2}$)|(^[0-9]{1,11}$)"))
							{
								if (invoiceDTO.FreightAmount == 0 || invoiceDTO.FreightAmount < 0)
								{
									errorResponse = $"{errorResponse} {newLine} Invalid Frieght Amount: {frieghtAmount} at (Row No. {rowCount}).";
								}
							}
							else
							{
								errorResponse = $"{errorResponse} {newLine} Invalid Frieght Amount: {frieghtAmount} at (Row No. {rowCount}).";
							}
						}
						catch
						{
							errorResponse = $"{errorResponse} {newLine} Invalid Frieght Amount: {frieghtAmount} at (Row No. {rowCount}).";
						}
					}
					else
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Freight Currency at (Row No. {rowCount}).";
					}
				}
				#endregion

				#region Insurance Amount
				InsuranceAmount = datatable.Rows[j][12].ToString().Trim();
				if (!String.IsNullOrEmpty(InsuranceAmount))
				{

					try
					{
						invoiceDTO.InsuranceAmount = Math.Round(Convert.ToDecimal(InsuranceAmount), 2);
						if (Regex.IsMatch(invoiceDTO.InsuranceAmount.ToString(), @"(^[0-9]{1,11}\.[0-9]{0,2}$)|(^[0-9]{1,11}$)"))
						{
							invoiceDTO.InsuranceAmount = Convert.ToDecimal(InsuranceAmount);
							if (invoiceDTO.InsuranceAmount == 0 || invoiceDTO.InsuranceAmount < 0)
							{
								errorResponse = $"{errorResponse} {newLine} Invalid Insurance Amount: {InsuranceAmount} at (Row No. {rowCount}).";
							}
						}
						else
						{
							errorResponse = $"{errorResponse} {newLine} Invalid Insurance Amount: {InsuranceAmount} at (Row No. {rowCount}).";
						}
					}
					catch
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Insurance Amount: {InsuranceAmount} at (Row No. {rowCount}).";
					}
				}
				#endregion


				#region Invoice Number
				invoiceRefNumber = datatable.Rows[j][13].ToString().Trim();
				if (String.IsNullOrEmpty(invoiceRefNumber))
				{
					errorResponse = $"{errorResponse} {newLine} Invalid Invoice Ref Number at (Row No. {rowCount}).";
				}
				else
				{
					if (IsFilteredSpecialCharExist(invoiceRefNumber) || invoiceRefNumber == "0")
					{
						errorResponse = $"{errorResponse} {newLine} Invalid Invoice Ref Number: {invoiceRefNumber} at (Row No. {rowCount}).";
					}
					else
					{
						invoiceDTO.InvoiceRefNumber = invoiceRefNumber;
					}
				}

				#endregion

				InvoiceDTOList.Add(invoiceDTO);
			}



			return errorResponse;

		}
		public string RemoveSpecialChar(string input)
		{
			if (!string.IsNullOrEmpty(input))
			{
				string clean = Regex.Replace(input, @"[^\w\s]", string.Empty);
				return clean;
			}
			return input;
		}

		public bool IsSpecialCharExist(string input)
		{
			if (!string.IsNullOrEmpty(input))
			{
				return Regex.IsMatch(input, @"[^\w\s]");

			}
			return false;
		}


		public bool IsFilteredSpecialCharExist(string input)
		{
			if (!string.IsNullOrEmpty(input))
			{
				return Regex.IsMatch(input, @"['""&]");

			}
			return false;
		}

		public bool InCorrectContainerNo(string input)
		{
			if (!String.IsNullOrEmpty(input))
			{
				return Regex.IsMatch(input, @"^[aA-zZ]{4}[0-9]{7}$");
			}
			return false;
		}


		[HttpGet]
		public ActionResult GetClientComputerName()
		{
			string addr, host, pc1, pc2, pc3, pc4, pc5, pc6;
			addr = Request.ServerVariables["REMOTE_ADDR"];
			host = Request.ServerVariables["REMOTE_HOST"];
			pc6 = this.HttpContext.Request.UserHostName;

			try
			{
				pc1 = System.Net.Dns.GetHostEntry(addr).HostName;
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				pc1 = ex.Message;
			}
			try
			{
				pc2 = System.Net.Dns.GetHostEntry(host).HostName;
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				pc2 = ex.Message;
			}
			try
			{
				pc3 = System.Net.Dns.GetHostByName(addr).HostName;
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				pc3 = ex.Message;
			}
			try
			{
				pc4 = System.Net.Dns.GetHostByName(host).HostName;
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				pc4 = ex.Message;
			}
			try
			{
				pc5 = System.Net.Dns.GetHostName();
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				pc5 = ex.Message;
			}

			return Json(new { addr, host, pc1, pc2, pc3, pc4, pc5, pc6 }, JsonRequestBehavior.AllowGet);

		}

	}
	public class ParameterForValidateChassisInvoice
	{
		public string centerCode { get; set; }
		public string jobNumber { get; set; }
		public string maqasa { get; set; }
		public string operationMode { get; set; }
	}
	public class ParameterForChassis
	{
		public string CenterCode { get; set; }
		public string jobNumber { get; set; }
		public string FilePath { get; set; }
	}
	public class DynamicResult
	{
		public string Messages { get; set; }
		public bool IsValid { get; set; }
	}

	public class RootUser
	{
		public string messages { get; set; }
		public string isValid { get; set; }
		public List<string> users { get; set; }
	}
	public class RootObject
	{
		public bool StatusIsSuccessful { get; set; }
		public object ErrorState { get; set; }
		public int ResponseCode { get; set; }
		public string ResponseResult { get; set; }
		public DynamicResult DynamicResult { get; set; }
	}
}
using ADP.MG.Mamar.Web;
using ADP.MG.Mamar.Web.ApiInfrastructure.Client;
using ADP.MG.Pcs.Common.Business;
using ApiHelper;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Compilation;
using System.Web.Mvc;
using ADP.MG.Mamar.Web.Models;

using Telerik.Reporting;
using ADP.MG.Mamar.Web.ApiInfrastructure;
using ADP.MG.Pcs.Models.CustomModels.ePayment;
using ADP.MG.Pcs.Common.Utility;
using ADP.MG.Pcs.Models.CustomModels.Subscription;
//using ADP.MG.Pcs.ePayment.Business;
using ADP.MG.Pcs.Common;
using ADP.MG.Pcs.ePayment.Business;
using System.Configuration;

namespace ADP.MG.Mamar.Web.Controllers
{
    public class SubscriptionController : Controller
    {
        // GET: Subscription
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Subscription() {
            return View();
        }
        [OutputCache(NoStore = true, Duration = 0, VaryByParam = "None")]
        [HttpGet]
        public async Task<JsonResult> Get(string targetUrl, dynamic data)
        {
            try
            {
                var customHeadersList = new Dictionary<string, string>();
                var selectedCompany = Request.Cookies["_selected_company_"];
                ITokenContainer tokenContainer = new TokenContainer();
                tokenContainer.ApiSelectedCompany = selectedCompany != null ? Server.UrlDecode(selectedCompany.Value) : "";
                var cSelectedCompany = !string.IsNullOrEmpty(Request.Headers["_selected_company_"]) ? Request.Headers["_selected_company_"].ToString() : string.Empty;
                customHeadersList.Add("_selected_company_", cSelectedCompany);

                string queryString = string.Empty;
                if (tokenContainer.ApiToken == null)
                {
                    return Json(new
                    {
                        redirectUrl = Url.Action("LogOff", "Account", new { area = string.Empty }),
                        isRedirect = true
                    }, JsonRequestBehavior.AllowGet);
                }
                if (!string.IsNullOrEmpty(((string[])data)[0]))
                {
                    var dataParams = JObject.Parse(((string[])data)[0]);
                    List<string> properties = new List<string>();
                    foreach (var param in dataParams)
                        properties.Add(string.Format("{0}={1}", param.Key, HttpUtility.JavaScriptStringEncode(param.Value.Value<string>())));
                    queryString = string.Join("&", properties.ToArray());
                }
                ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpSubscriptionClient.Instance, tokenContainer);
                GenericClient cb = new GenericClient(client);
                var response = await cb.Get(targetUrl + "?" + queryString, customHeadersList);
                return Json(response, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        [OutputCache(NoStore = true, Duration = 0, VaryByParam = "None")]
        [HttpPost]
        public async Task<JsonResult> Post(ADP.MG.Mamar.Web.Models.ApiModel apiModel)
        {
            ITokenContainer tokenContainer = new TokenContainer();

            if (tokenContainer.ApiToken == null)
            {
                return Json(new
                {
                    redirectUrl = Url.Action("LogOff", "Account", new { area = string.Empty }),
                    isRedirect = true
                }, JsonRequestBehavior.AllowGet);
            }
            var data = GetTargetData(apiModel);
            ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpSubscriptionClient.Instance, tokenContainer);
            GenericClient cb = new GenericClient(client);
            var response = await cb.Post(apiModel.ApiUrl, data);
            return Json(response, JsonRequestBehavior.AllowGet);
        }
        private static dynamic GetTargetData(ADP.MG.Mamar.Web.Models.ApiModel apiModel)
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

      
        public ActionResult DownloadReport(string InvoiceNumber)
        {
            //ViewBag.ParamValue = "";
            //var typeReportSource = new UriReportSource { Uri = string.Format("Subscription/Reports/{0}", "SubscriptionPaymentAdvice.trdx") };
            //typeReportSource.Parameters.Add("InvoiceNumber", InvoiceNumber);
            //Telerik.Reporting.Processing.ReportProcessor reportProcessor = new Telerik.Reporting.Processing.ReportProcessor();
            //Telerik.Reporting.Processing.RenderingResult result = reportProcessor.RenderReport("PDF", typeReportSource, null);
            //byte[] contents = result.DocumentBytes;
            //return File(contents, string.Format("application/{0}", "PDF"), "SubscriptionPaymentAdvice.pdf");
            string strReceiptUrl = string.Format(ConfigurationManager.AppSettings["DefaultURL"] + "/Subscription/DownloadReport?InvoiceNumber={0}", InvoiceNumber);
            return Redirect(strReceiptUrl);
        }

        public ActionResult GetCompanywithName(string[] companyIds)
        {
            PCSInformationsBusinessLogic pcsInformationsBusiness = new PCSInformationsBusinessLogic();
            try
            {
                var companies = pcsInformationsBusiness.GetCompanywithName(companyIds);
                return Json(companies, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
            }
            finally
            {
                pcsInformationsBusiness = null;
            }
            return Json(string.Empty, JsonRequestBehavior.AllowGet);

        }
        public async Task<ActionResult> DownloadReportReceipt(string InvoiceNumber)
        {
            //ViewBag.ParamValue = "";
            //ITokenContainer tokenContainer = new TokenContainer();
            //var typeReportSource = new UriReportSource { Uri = string.Format("Subscription/Reports/{0}", "SubscriptionPaymentReceipt.trdx") };

            //typeReportSource.Parameters.Add("InvoiceNumber", InvoiceNumber);
            //Telerik.Reporting.Processing.ReportProcessor reportProcessor = new Telerik.Reporting.Processing.ReportProcessor();
            //Telerik.Reporting.Processing.RenderingResult result = reportProcessor.RenderReport("PDF", typeReportSource, null);
            //byte[] contents = result.DocumentBytes;
            //return File(contents, string.Format("application/{0}", "PDF"), "SubscriptionPaymentReceipt.pdf");
            string strReceiptUrl = string.Format(ConfigurationManager.AppSettings["DefaultURL"] + "/SubscriptionPayment/DownloadReport?InvoiceNumber={0}", InvoiceNumber);
            return Redirect(strReceiptUrl);
        }
        public async Task<ActionResult> PaymentResponse()
        {
            ResponseViewModel responseViewModel = new ResponseViewModel();
            try
            {
                var RequestParameter = Request["RequestParameter"];
                var url = Request.Url.ToString();
                MGRequest request = new MGRequest();
                responseViewModel = request.ProcessPaymentResponse(RequestParameter);
                string username = string.Empty;
                if (responseViewModel != null)
                {
                    HttpClient client = new HttpClient();
                    var item = new { TradeLicenseNumber = responseViewModel.TradeLicenseNumber, OrderNumber = responseViewModel.OrderNumber, BankStatus = responseViewModel.Status };
                    var UpdateStatusUrl = HttpSubscriptionClient.Instance.BaseAddress.AbsoluteUri
                        + "api/subscription/endsubscriptionrequest/" +
                        responseViewModel.TradeLicenseNumber + "/" + responseViewModel.OrderNumber + "/" + responseViewModel.OnlineRefID + "/" + responseViewModel.Status;
                    HttpResponseMessage response = client.PostAsJsonAsync(UpdateStatusUrl, item).Result;
                    response.EnsureSuccessStatusCode();
                    HttpContext.Session["SubscriptionStatus"] = null;
                }
            }
            catch (Exception ex)
            {
                //Utility.objUtility.GenerateLogs("SubscriptionPaymentResponse", "SubscriptionPaymentResponse" + ex.Message, User.Identity.Name, false);
            }
            return Redirect(string.Format("~/Home/Index#/subscriptionPaymentResponse/{0}/{1}", responseViewModel.OnlineRefID, responseViewModel.Status));

        }

        public async Task<ActionResult> MamarPay(SubscriptionPayment payment)
        {
            try
            {
                payment.DefaultUrl = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["DefaultURL"]);
                var MamarBaseUrl = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["MamarBaseUrl"]);
                payment.PaymentReturnUrl = MamarBaseUrl + "/Subscription/PaymentResponse";
                payment.UserName = User.Identity.Name;

                //Begin Subscription 
                BeginSubscriptionRequestDTO dto = new BeginSubscriptionRequestDTO(payment);
                var status = await Post(new ADP.MG.Mamar.Web.Models.ApiModel() { Data = JsonConvert.SerializeObject(dto), ApiUrl = "subscription/beginsubscriptionrequest" });
                SubscriptionResponseRoot subscriptionResponse = JsonConvert.DeserializeObject<SubscriptionResponseRoot>
                                        (((ApiHelper.Response.ApiResponse)status.Data).ResponseResult.ToString());

                SubscriptionPay subscriptionPay = new SubscriptionPay();
                string serviceRequestId = string.Empty;
                if (subscriptionResponse.SubscriptionResponse != null && subscriptionResponse.SubscriptionResponse.SubscriptionNo != null && subscriptionResponse.SubscriptionResponse.PaymentStatus != "inprogress")
                {
                    PaymentProcessBusinessLogic business = new PaymentProcessBusinessLogic();
                    string[] revenueCodes = new string[1];
                    revenueCodes[0] = payment.RevenueCode;
                    var vatResponse = business.GetVatDetails(payment.UCID, revenueCodes);
                    SubcriptionEntityResponse entity = subscriptionPay.SubscriptionPayment(payment, subscriptionResponse, vatResponse);
                    entity.PaymentProcessModel = business.InitiateBusinessPayment(entity.PaymentProcessModel);
                    return Json(entity.PaymentProcessModel.PaymentForm + "<input type='hidden' id='SrId' value='" + serviceRequestId + "'/>", JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { failed = true, message = subscriptionResponse.msg, paymentStatus = subscriptionResponse.SubscriptionResponse.PaymentStatus }, JsonRequestBehavior.AllowGet);
                }
            }

            catch (Exception ex)
            {
                LogErrorInMgApp("Subscription/MamarPay", ex.ToString(), null);
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        private void LogErrorInMgApp(string targetUrl, string data, string response)
        {
            ITokenContainer tokenContainer = new TokenContainer();
            ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, tokenContainer);
            GenericClient cb = new GenericClient(client);
            cb.LogErrorinMgApp("PCSWEBREQUESTURL:" + targetUrl);
            if (data != null)
                cb.LogErrorinMgApp("PCSWEBDATA:" + data);
            if (response != null)
                cb.LogErrorinMgApp("PCSWEBRESPONSE:" + response);
        }
    }
}
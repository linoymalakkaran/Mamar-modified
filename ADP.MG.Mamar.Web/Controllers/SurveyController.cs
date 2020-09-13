using ADP.MG.Mamar.Web.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ADP.MG.Mamar.Web.Controllers
{
    public class SurveyController : Controller
    {
        // GET: Survey
        public ActionResult Index()
        {
            SurveyModel model = new SurveyModel()
            {
                AppName = ConfigurationManager.AppSettings["MGSurveyAppName"],
                AppSecret = ConfigurationManager.AppSettings["MGSurveyAppKey"],
                BaseUrl = ConfigurationManager.AppSettings["MGSurveyApiURL"],
                GetSurveyRelativeUrl = ConfigurationManager.AppSettings["MGSurveyApiURL"]
            };
            return View(model);
        }
    }
}
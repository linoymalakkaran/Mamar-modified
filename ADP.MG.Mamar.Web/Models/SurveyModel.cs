using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ADP.MG.Mamar.Web.Models
{
    public class SurveyModel
    {
        public string BaseUrl { get; set; }
        public string GetSurveyRelativeUrl { get; set; }
        public string AppName { get; set; }
        public string AppSecret { get; set; }
        public string UserName { get; set; }
    }
}
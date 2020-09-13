using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ADP.MG.Mamar.Web.Models
{
    public class ApiModel
    {
        public string ApiUrl { get; set; }
        public string TargetType { get; set; }
        public dynamic Data { get; set; }
        public dynamic ExtraData { get; set; }
        //public dynamic UserAccountInfo { get; set; }
    }
}
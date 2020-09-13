using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Serilog;
using System.Configuration;
using System.Diagnostics;


namespace ADP.MG.Mamar.Web.Models
{
    public class CentralELKLogger
    {
        public static ILogger _errorlog;
        public static CentralELKLogger objCentarlLogs = new CentralELKLogger();
        public void ConfigureLogs()
        {
            //ModuleIndexLogSelection("");
            var elSearchUrl = ConfigurationManager.AppSettings["ElasticSearchUrl"];
            if (!String.IsNullOrEmpty(elSearchUrl))
            {
                _errorlog = new LoggerConfiguration()
                   .ReadFrom.AppSettings()
                  .CreateLogger();
            }
        }
        public void ModuleIndexLogSelection(string moduleindex)
        {
            try
            {
                var config = System.Web.Configuration.WebConfigurationManager.OpenWebConfiguration("~");
                config.AppSettings.Settings["serilog:write-to:Elasticsearch.indexFormat"].Value = "";
                if (config.AppSettings.Settings["serilog:write-to:Elasticsearch.indexFormat"] != null && string.IsNullOrEmpty(config.AppSettings.Settings["serilog:write-to:Elasticsearch.indexFormat"].ToString()))
                {
                    switch (moduleindex)
                    {
                        case "Vessel Registration":
                            config.AppSettings.Settings["serilog:write-to:Elasticsearch.indexFormat"].Value = "mg-pcs-web-vesselregister-{0:yyyy.MM.dd}";
                            break;
                        default:
                            config.AppSettings.Settings.Add("serilog:write-to:Elasticsearch.indexFormat", "mg-pcs-web-log-{0:yyyy.MM.dd}");
                            break;
                    }
                }
                else { config.AppSettings.Settings.Add("serilog:write-to:Elasticsearch.indexFormat", "mg-pcs-web-log-{0:yyyy.MM.dd}"); }
                config.Save();
            }
            catch (Exception ex)
            {
                _errorlog.Fatal(ex, ex.Message);
            }
        }
    }
}
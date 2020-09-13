using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Telerik.Reporting;
using ADP.MG.Mamar.Web.ReportHelper;
using ADP.MG.Mamar.Web.ReportHelper.DTO;
using System.Threading.Tasks;

namespace ADP.MG.Mamar.Web.ReportHelper
{
    public class GMSDashboardHelper
    {
        public async Task<byte[]> GetReport(string Type, string basepath, CustomClearanceBIZSearchDTO arg)
        {
            var helper = new ReportHelper();
            var datasource = new Telerik.Reporting.ObjectDataSource();
            arg.gmsDashboardSearchFilter.pageNo = 0;
            datasource.DataSource = helper.GetGMSReleaseReportData(arg);
            Telerik.Reporting.Report instanceReport;
            var settings = new System.Xml.XmlReaderSettings();
            settings.IgnoreWhitespace = true;
            var path = basepath + "/Report/GMSStatusReport.trdx";
            using (System.Xml.XmlReader xmlReader = System.Xml.XmlReader.Create(path, settings))
            {
                var xmlSerializer = new Telerik.Reporting.XmlSerialization.ReportXmlSerializer();
                instanceReport = (Telerik.Reporting.Report)xmlSerializer.Deserialize(xmlReader);
            }
            Telerik.Reporting.Table tbl = instanceReport.Items.Find("table1", true)[0] as Telerik.Reporting.Table;
            tbl.DataSource = datasource;
            DateTime frmdate;
            if (DateTime.TryParseExact(arg.gmsDashboardSearchFilter.fromDT,
                       "yyyy-MM-dd HH:mm:ss",
                       System.Globalization.CultureInfo.InvariantCulture,
                       System.Globalization.DateTimeStyles.None,
                       out frmdate))
            {
                instanceReport.ReportParameters["FromDate"].Value = frmdate.ToString("dd/MM/yyyy");
            }
            else
                instanceReport.ReportParameters["FromDate"].Value = string.Empty;

            DateTime todate;
            if (DateTime.TryParseExact(arg.gmsDashboardSearchFilter.toDT,
                       "yyyy-MM-dd HH:mm:ss",
                       System.Globalization.CultureInfo.InvariantCulture,
                       System.Globalization.DateTimeStyles.None,
                       out todate))
            {
                instanceReport.ReportParameters["ToDate"].Value =todate.ToString("dd/MM/yyyy");
            }
            else
                instanceReport.ReportParameters["ToDate"].Value = string.Empty;

            //instanceReport.ReportParameters.Add("ToDate", parameters[1]);
            Telerik.Reporting.Processing.ReportProcessor reportProcessor = new Telerik.Reporting.Processing.ReportProcessor();
            Telerik.Reporting.Processing.RenderingResult result = reportProcessor.RenderReport(Type, new InstanceReportSource { ReportDocument = instanceReport }, null);
            byte[] contents = result.DocumentBytes;
            return contents;
        }
    }
}
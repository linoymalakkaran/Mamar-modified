using ADP.MG.Oracle.Models.CustomsModels.Manifest;
using ADP.MG.Pcs.Integration.Business;
using ADP.MG.Pcs.IntranetService.Agent.Business.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ADP.MG.Mamar.Web.Models;
using Microsoft.AspNet.Identity;

namespace ADP.MG.Mamar.Web.Controllers
{
    public class ManifestController : Controller
    {
        [HttpPost]
        public void AddUpdateManifest(AddUpdateManifest manifest)
        {
            try
            {
                var manafathBL = new ManafathBusinessLogic();
                var username = User.Identity.Name;
                manafathBL.AddUpdateSubDOManifest(manifest, username);
            }
            catch (Exception ex)
            {
                string errorMsg = (ex.Message + ex.InnerException + ex.StackTrace).ToString();
                using (var loggerHelper = new LoggerHelper())
                {
                    loggerHelper.LogMessage("ERR_AddUpdateManifest", errorMsg, User.Identity.Name, true);
                }
            }
        }

        [HttpPost]
        public void AddUpdateMFContainer(AddUpdateContainer mfContainer)
        {
            try
            {
                var manafathBL = new ManafathBusinessLogic();
                var username = User.Identity.Name;
                manafathBL.AddUpdateSubDOContainer(mfContainer, username);
            }
            catch (Exception ex)
            {
                string errorMsg = (ex.Message + ex.InnerException + ex.StackTrace).ToString();
                using (var loggerHelper = new LoggerHelper())
                {
                    loggerHelper.LogMessage("ERR_AddUpdateMFContainer", errorMsg, User.Identity.Name, true);
                }
            }
        }

        [HttpPost]
        public void AddUpdateMFChassis(AddUpdateChassis mfChassis)
        {
            try
            {
                var manafathBL = new ManafathBusinessLogic();
                var username = System.Web.HttpContext.Current.User.Identity.Name;
                manafathBL.AddUpdateSubDOChassis(mfChassis, username);
            }
            catch (Exception ex)
            {
                string errorMsg = (ex.Message + ex.InnerException + ex.StackTrace).ToString();
                CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
                using (var loggerHelper = new LoggerHelper())
                {
                    loggerHelper.LogMessage("ERR_AddUpdateMFChassis", errorMsg, User.Identity.Name, true);
                }
            }
        }

        [HttpGet]
        public void DeleteMasterBL(string vesselCode, string voyageNumber, string masterBLNumber, string arrivalDate)
        {
            try
            {
                var manafathBL = new ManafathBusinessLogic();
                var username = User.Identity.Name;
                manafathBL.DeleteMasterBL(vesselCode, voyageNumber, arrivalDate, masterBLNumber, username);
            }
            catch (Exception ex)
            {
                string errorMsg = (ex.Message + ex.InnerException + ex.StackTrace).ToString();
                CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + errorMsg + " User Name " + User.Identity.GetUserName());
                using (var loggerHelper = new LoggerHelper())
                {
                    loggerHelper.LogMessage("ERR_DeleteMasterBL", errorMsg, User.Identity.Name, true);
                }
            }
        }

        [HttpGet]
        public void DeleteHouseBL(string vesselCode, string voyageNumber, string masterBLNumber, string houseBLNumber, string arrivalDate)
        {
            try
            {
                var manafathBL = new ManafathBusinessLogic();
                var username = User.Identity.Name;
                manafathBL.DeleteHouseBL(vesselCode, voyageNumber, arrivalDate, masterBLNumber, houseBLNumber, username);
            }
            catch (Exception ex)
            {
                string errorMsg = (ex.Message + ex.InnerException + ex.StackTrace).ToString();
                CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + errorMsg + " User Name " + User.Identity.GetUserName());
                using (var loggerHelper = new LoggerHelper())
                {
                    loggerHelper.LogMessage("ERR_DeleteHouseBL", errorMsg, User.Identity.Name, true);
                }
            }
        }

        [HttpGet]
        public void DeleteMFContainer(string vesselCode, string voyageNumber, string masterBLNumber, string houseBLNumber, string containerNumber)
        {
            try
            {
                var manafathBL = new ManafathBusinessLogic();
                var username = System.Web.HttpContext.Current.User.Identity.Name;
                manafathBL.DeleteMFContainer(vesselCode, voyageNumber, masterBLNumber, houseBLNumber, containerNumber, username);
            }
            catch (Exception ex)
            {
                string errorMsg = (ex.Message + ex.InnerException + ex.StackTrace).ToString();
                CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + errorMsg + " User Name " + User.Identity.GetUserName());
                using (var loggerHelper = new LoggerHelper())
                {
                    loggerHelper.LogMessage("ERR_DeleteMFContainer", errorMsg, User.Identity.Name, true);
                }
            }
        }

        [HttpGet]
        public void DeleteMFChassis(string vesselCode, string voyageNumber, string masterBLNumber, string houseBLNumber, string chassisNumber)
        {
            try
            {
                var manafathBL = new ManafathBusinessLogic();
                var username = User.Identity.Name;
                manafathBL.DeleteMFChassis(vesselCode, voyageNumber, masterBLNumber, houseBLNumber, chassisNumber, username);
            }
            catch (Exception ex)
            {
                string errorMsg = (ex.Message + ex.InnerException + ex.StackTrace).ToString();
                CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + errorMsg + " User Name " + User.Identity.GetUserName());
                using (var loggerHelper = new LoggerHelper())
                {
                    loggerHelper.LogMessage("ERR_DeleteMFChassis", errorMsg, User.Identity.Name, true);
                }
            }
        }
    }
}
using System.Web;
using System.Web.Optimization;

namespace ADP.MG.Mamar.Web
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                     "~/Scripts/libs/jquery/jquery/dist/jquery.js",
                     "~/Scripts/libs/jquery/jquery/dist/jquery-ui.min.js",
                     "~/Scripts/libs/jquery/jqueryui/autoresize.js",
                     "~/Scripts/libs/jquery/SignalR/signalr.min.js"
                     ));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                    "~/global_assets/js/core/libraries/bootstrap.min.js",
                    "~/Scripts/libs/jquery/bootstrap-datetimepicker/moment.js",
                    "~/Scripts/libs/jquery/bootstrap-datetimepicker/bootstrap-datetimepicker.js"
                    ));

            bundles.Add(new ScriptBundle("~/bundles/angular").Include(
                  "~/Scripts/libs/angular/angular/angular.js",
                  "~/Scripts/libs/angular/angular-aria/angular-aria.js",
                  "~/Scripts/libs/angular/angular-cookies/angular-cookies.js",
                  "~/Scripts/libs/angular/angular-messages/angular-messages.js",
                  "~/Scripts/libs/angular/angular-resource/angular-resource.js",
                  "~/Scripts/libs/angular/angular-sanitize/angular-sanitize.js",
                  "~/Scripts/libs/angular/angular-touch/angular-touch.js",
                  "~/Scripts/libs/angular/angular-loadingbar/loading-bar.js",
                  "~/Scripts/libs/angular/angular-ui-router/release/angular-ui-router.js",
                  "~/Scripts/libs/angular/angular-ui-utils/ui-utils.js",
                  "~/Scripts/libs/angular/angular-filter.js",
                  "~/Scripts/AngularScripts/directives/angular-bootstrap-datetimepicker-directive.js",
                  "~/Scripts/libs/angular/dirPagination.js"
              ));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap/tpls").Include(
                "~/Scripts/libs/angular/angular-bootstrap/ui-bootstrap-tpls.js",
                "~/Scripts/libs/angular/oclazyload/dist/ocLazyLoad.js",
                "~/Scripts/libs/angular/angular-translate/angular-translate.js",
                "~/Scripts/libs/angular/atls-files/atls-files.js",
                "~/Scripts/libs/angular/ats-cookie/ats-cookie.js",
                "~/Scripts/libs/angular/ats-local/ats-local.js",
                 "~/Scripts/libs/assets/underscore/underscore.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/kendo").Include(
               "~/Scripts/AngularScripts/directives/angucomplete-alt.js"
               ));

            bundles.Add(new ScriptBundle("~/bundles/assets").Include(
                  "~/global_assets/js/plugins/loaders/pace.min.js",
                  "~/global_assets/js/plugins/loaders/blockui.min.js",
                  "~/global_assets/js/plugins/ui/nicescroll.min.js",
                  "~/global_assets/js/plugins/ui/drilldown.js",
                  "~/global_assets/js/plugins/ui/fab.min.js",
                  "~/global_assets/js/plugins/visualization/d3/d3.min.js",
                  "~/global_assets/js/plugins/visualization/d3/d3_tooltip.js",
                  "~/global_assets/js/plugins/forms/styling/switchery.min.js",
                  "~/global_assets/js/plugins/ui/moment/moment.min.js",
                  "~/global_assets/js/plugins/pickers/daterangepicker.js",
                  "~/assets/js/bootstrap-select.js",
                  "~/global_assets/js/plugins/forms/selects/bootstrap_multiselect.js",
                  "~/global_assets/js/plugins/notifications/noty.min.js",
                  "~/global_assets/js/plugins/notifications/jgrowl.min.js",
                  "~/global_assets/js/plugins/notifications/sweet_alert.min.js",
                  "~/global_assets/js/plugins/notifications/components_notifications_other.js",
                  "~/global_assets/js/plugins/forms/styling/uniform.min.js",
                  "~/global_assets/js/plugins/forms/styling/switch.min.js",
                  "~/global_assets/js/plugins/forms/inputs/typeahead/handlebars.min.js",
                  "~/global_assets/js/plugins/forms/inputs/alpaca/alpaca.min.js",
                  "~/global_assets/js/plugins/forms/selects/select2.min.js",
                  "~/global_assets/js/plugins/pickers/pickadate/picker.js",
                  "~/global_assets/js/plugins/pickers/pickadate/picker.date.js",
                  "~/global_assets/js/plugins/visualization/echarts/echarts.min.js"
                 ));

            bundles.Add(new ScriptBundle("~/bundles/gmsApp").Include(
                 "~/Scripts/env.js",
                 "~/Scripts/AngularScripts/mamarApp.js",
                  "~/Scripts/AngularScripts/config.js",
                 "~/Scripts/AngularScripts/config.lazyload.js",
                 "~/Scripts/AngularScripts/config-router.js",
                 "~/Scripts/AngularScripts/services/ApiService.js",
                 "~/Scripts/AngularScripts/directives/mamarDirectives.js",
                 "~/Scripts/AngularScripts/directives/tabset.js",
                 "~/Scripts/AngularScripts/controllers/gmsIndexController.js",
                 "~/Scripts/AngularScripts/services/userAccountStorageFactory.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/app").Include(
                 "~/Scripts/AngularScripts/mamarApp.js",
                  "~/Scripts/AngularScripts/config.js",
                 "~/Scripts/AngularScripts/config.lazyload.js",
                 "~/Scripts/AngularScripts/config-router.js",
                 "~/Scripts/AngularScripts/services/ApiService.js",
                 "~/Scripts/AngularScripts/directives/mamarDirectives.js",
                  "~/Scripts/AngularScripts/directives/mamarCustomLookup.js",
                 "~/Scripts/AngularScripts/directives/tabset.js",
                 "~/Scripts/AngularScripts/controllers/IndexController.js",
                 "~/Scripts/AngularScripts/controllers/userIndexController.js",
                 "~/Scripts/AngularScripts/services/exemptionEntryGroupInfoService.js",
                 "~/Scripts/AngularScripts/services/maqasaReExportFactory.js",
                 "~/Scripts/AngularScripts/services/userAccountStorageFactory.js",
                 "~/Scripts/AngularScripts/indexDBRepository.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/userApp").Include(
                "~/Scripts/AngularScripts/mamarApp.js",
                  "~/Scripts/AngularScripts/config.js",
                 "~/Scripts/AngularScripts/config.lazyload.js",
                 "~/Scripts/AngularScripts/config-router.js",
                 "~/Scripts/AngularScripts/services/ApiService.js",
                 "~/Scripts/AngularScripts/directives/mamarDirectives.js",
                 "~/Scripts/AngularScripts/directives/tabset.js",
                 "~/Scripts/AngularScripts/controllers/userIndexController.js",
                 "~/Scripts/AngularScripts/services/exemptionEntryGroupInfoService.js",
                 "~/Scripts/AngularScripts/services/maqasaReExportFactory.js",
                 "~/Scripts/AngularScripts/services/userAccountStorageFactory.js"
              ));
            bundles.Add(new StyleBundle("~/bundle/theme/css").Include(
                      "~/global_assets/css/icons/icomoon/styles.css",
                      "~/assets/css/bootstrap.min.css",
                      "~/assets/css/core.min.css",
                      "~/assets/css/components.min.css",
                      "~/assets/css/colors.min.css",
                      "~/assets/css/bootstrap-select.css",
                      "~/assets/css/bootstrap-datetimepicker.min.css",
                       "~/global_assets/css/icons/fontawesome/styles.min.css",
                       "~/global_assets/css/icons/fontawesome/css/all.css",
                       "~/assets/css/my-style.css"
                      ));

           BundleTable.EnableOptimizations = false;

        }
    }
}

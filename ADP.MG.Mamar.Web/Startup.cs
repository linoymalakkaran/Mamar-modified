using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(ADP.MG.Mamar.Web.Startup))]
namespace ADP.MG.Mamar.Web
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}

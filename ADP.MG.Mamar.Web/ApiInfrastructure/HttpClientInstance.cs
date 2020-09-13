namespace ADP.MG.Mamar.Web.ApiInfrastructure
{
    using System;
    using System.Net.Http;

    /// <summary>
    /// Creates a Singleton instance of HttpClient - note that this is for demo purposes only. 
    /// I would recommend that you use a Dependency Injection container such as Autofac for managing the lifecycle of your objects.
    /// If we used Autofac here there would be no need for this class.
    /// </summary>
    public static class HttpClientInstance
    {
        private static readonly HttpClient instance = new HttpClient { BaseAddress = new Uri(System.Configuration.ConfigurationManager.AppSettings["MamarAppSysApiURL"]), Timeout = new TimeSpan(0, 10, 0) };

        public static HttpClient Instance
        {
            get { return instance; }
        }
    }
    public static class HttpSubscriptionClient
    {
        private static readonly HttpClient instance = new HttpClient { BaseAddress = new Uri(Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["SubscriptionFeeServiceUrl"]) == null ?string.Empty: System.Configuration.ConfigurationManager.AppSettings["SubscriptionFeeServiceUrl"]), Timeout = new TimeSpan(0, 10, 0) };

        public static HttpClient Instance
        {
            get { return instance; }
        }
    }
}
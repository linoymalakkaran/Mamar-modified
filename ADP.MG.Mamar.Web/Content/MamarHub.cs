using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;

namespace ADP.MG.Mamar.Web.Content
{
	public class MamarHub : Hub
	{
	
		public void ChassisResponse(string message,List<string> users,string IsVALID,string JobNumber,string currentUser,dynamic ValidateMessage)
		{
        	IHubContext hubContext = GlobalHost.ConnectionManager.GetHubContext<MamarHub>();
			//foreach (var item in users)
			//hubContext.Clients.User(item).chassisResponse(message);

			users.ForEach(x => hubContext.Clients.User(x).chassisResponse(message, IsVALID,JobNumber,currentUser, ValidateMessage));
		}

        public void PreClearanceResponse(string user, dynamic message, string jobNumber, string centerCode)
        {
            IHubContext hubContext = GlobalHost.ConnectionManager.GetHubContext<MamarHub>();
            hubContext.Clients.User(user).preclearResponse(user, message, jobNumber, centerCode);
        }


    }
}
const EventService = require('../services/eventService');
const EventView = require('../views/eventView');

class EventController{
    async createEvent(req,res){
        try{
            const{title,description,date,time,location,orginizerId} = req.body;
            const event = await EventService.createEvent(title,description,date,time,location,orginizerId);
            EventView.renderSuccess(res,event);
        }catch (error){
            EventView.renderError(res, error.message);
        }
    }
    async getEvents(req,res){
        try{
            const events = await EventService.getEvents();
            EventView.renderSuccess(res,events);
        } catch(error){
            EventView.renderError(res,error.message);
        }
    }
    async registerForEvent(req,res){
        try{
            const {eventId, userId} = req.body;
            const registration = await EventService.registerForEvent(eventId,userId);
            EventView.renderSuccess(res,registration);
        } catch(error){
            EventView.renderError(res,error.message);
        }
    }
    async confirmrefistration(req,res){
        try{
            const{registrationId}=req.params
            const registration = await EventService.registerForEvent(registrationId);
            EventView.renderSuccess(res,registration);
        } catch(error){
            EventView.renderError(res,error.message);
        }
    }
}
module.exports = new EventController();
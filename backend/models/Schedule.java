public class Schedule {

    private String id;
    private int dayOfWeek;
    private String startTime;
    private String endTime;
    private boolean isAvailable;
    private String startDateOffService;
    private String endDateOffService;

    public Schedule() {}

    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }

    public int getDayOfWeek() {
        return dayOfWeek;
    }
    
    public void setDayOfWeek(int dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public String getStartTime() {
        return startTime;
    }
    
    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }
    
    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public boolean isAvailable() {
        return isAvailable;
    }
    
    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public String getStartDateOffService() {
        return startDateOffService;
    }

    public void setStartDateOffService(String startDateOffService) {
        this.startDateOffService = startDateOffService;
    }

    public String getEndDateOffService() {
        return endDateOffService;
    }

    public void setEndDateOffService(String endDateOffService) {
        this.endDateOffService = endDateOffService;
    }
}
